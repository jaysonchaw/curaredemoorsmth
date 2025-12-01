#!/usr/bin/env python3
"""
Script to add question variation to lessons:
- Multiple choice (MCQ)
- Text answer (type in)
- Fill in the blank

For MCQ: Generates plausible options based on lesson content
For Fill in the blank: Extracts key words from text and creates blanks
"""

import json
import re
import random
from collections import Counter

# Common filler words to avoid
FILLER_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'it', 'its', 'they', 'them', 'their', 'there', 'here', 'where', 'when', 'what', 'who', 'how',
    'very', 'more', 'most', 'some', 'any', 'all', 'each', 'every', 'many', 'much', 'few', 'little'
}

# Medical/biology key words that are good for fill-in-the-blank
KEY_WORD_PATTERNS = [
    r'\b(heart|brain|lungs|stomach|kidney|liver|muscle|bone|cell|tissue|organ|system)\b',
    r'\b(doctor|nurse|patient|hospital|clinic|medicine|treatment|diagnosis|surgery)\b',
    r'\b(blood|oxygen|carbon|dioxide|nutrient|waste|energy|protein|vitamin|mineral)\b',
    r'\b(circulatory|respiratory|digestive|nervous|skeletal|muscular|immune|endocrine)\b',
    r'\b(artery|vein|capillary|nerve|neuron|synapse|hormone|enzyme|antibody|antigen)\b'
]

def extract_key_words(text):
    """Extract important medical/biology terms from text"""
    key_words = []
    text_lower = text.lower()
    
    for pattern in KEY_WORD_PATTERNS:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        key_words.extend(matches)
    
    # Also look for capitalized words (likely proper nouns or important terms)
    capitalized = re.findall(r'\b[A-Z][a-z]+\b', text)
    key_words.extend([w.lower() for w in capitalized if w.lower() not in FILLER_WORDS])
    
    # Count frequency and return most common
    word_counts = Counter(key_words)
    # Return words that appear at least once and are not fillers
    important_words = [word for word, count in word_counts.items() 
                      if word.lower() not in FILLER_WORDS and len(word) > 3]
    
    return list(set(important_words))  # Remove duplicates

def create_fill_in_blank(text, key_word):
    """Create a fill-in-the-blank question by removing a key word"""
    # Find sentences containing the key word
    sentences = re.split(r'[.!?]+', text)
    target_sentence = None
    
    for sentence in sentences:
        if re.search(r'\b' + re.escape(key_word) + r'\b', sentence, re.IGNORECASE):
            target_sentence = sentence.strip()
            break
    
    if not target_sentence:
        return None
    
    # Replace the key word with a blank
    blank_sentence = re.sub(
        r'\b' + re.escape(key_word) + r'\b',
        '______',
        target_sentence,
        flags=re.IGNORECASE
    )
    
    return blank_sentence.strip()

def generate_mcq_options(correct_answer, lesson_text, num_options=4):
    """Generate plausible multiple choice options"""
    options = [correct_answer]
    
    # Extract other key terms from the lesson
    key_words = extract_key_words(lesson_text)
    
    # Remove the correct answer from key words
    key_words = [w for w in key_words if w.lower() != correct_answer.lower()]
    
    # Generate wrong options
    wrong_options = []
    if len(key_words) >= num_options - 1:
        # Use related terms
        wrong_options = random.sample(key_words, min(num_options - 1, len(key_words)))
    else:
        # Use generic wrong answers
        generic_wrong = ['incorrect', 'wrong', 'false', 'none', 'unknown', 'other']
        wrong_options = generic_wrong[:num_options - 1]
    
    options.extend(wrong_options)
    
    # Shuffle but remember correct index
    correct_index = 0
    random.shuffle(options)
    correct_index = options.index(correct_answer)
    
    return options, correct_index

def assign_question_format(question_text, lesson_text, question_index, total_questions):
    """Intelligently assign question format"""
    # Mix of formats: ~40% text_answer, ~30% multiple_choice, ~30% fill_in_blank
    format_ratio = question_index % 10
    
    if format_ratio < 4:
        return 'text_answer'
    elif format_ratio < 7:
        return 'multiple_choice'
    else:
        return 'fill_in_blank'

def process_lesson(lesson_data):
    """Process a lesson and add question variation"""
    content = lesson_data.get('content', {})
    lesson_text = content.get('text', '')
    
    # Process tasks
    tasks = content.get('tasks', [])
    for i, task in enumerate(tasks):
        question_text = task.get('question', '')
        current_format = task.get('questionFormat', 'text_answer')
        
        # Assign new format
        new_format = assign_question_format(question_text, lesson_text, i, len(tasks))
        task['questionFormat'] = new_format
        
        if new_format == 'multiple_choice':
            # Extract a key term from the question or text
            key_words = extract_key_words(question_text + ' ' + lesson_text)
            if key_words:
                correct_answer = random.choice(key_words[:5])  # Pick from top 5
                options, correct_index = generate_mcq_options(correct_answer, lesson_text)
                task['options'] = options
                task['correct'] = correct_index
            else:
                # Fallback to text_answer if we can't generate good options
                task['questionFormat'] = 'text_answer'
        
        elif new_format == 'fill_in_blank':
            # Find a key word to remove
            key_words = extract_key_words(lesson_text)
            if key_words:
                key_word = random.choice(key_words[:10])  # Pick from top 10
                blank_text = create_fill_in_blank(lesson_text, key_word)
                if blank_text:
                    task['question'] = blank_text
                    task['correct_answer'] = key_word
                else:
                    # Fallback to text_answer
                    task['questionFormat'] = 'text_answer'
            else:
                task['questionFormat'] = 'text_answer'
    
    # Process follow-ups (same logic)
    follow_ups = content.get('followUps', [])
    for i, follow_up in enumerate(follow_ups):
        question_text = follow_up.get('question', '')
        current_format = follow_up.get('questionFormat', 'text_answer')
        
        new_format = assign_question_format(question_text, lesson_text, i + len(tasks), len(follow_ups) + len(tasks))
        follow_up['questionFormat'] = new_format
        
        if new_format == 'multiple_choice':
            key_words = extract_key_words(question_text + ' ' + lesson_text)
            if key_words:
                correct_answer = random.choice(key_words[:5])
                options, correct_index = generate_mcq_options(correct_answer, lesson_text)
                follow_up['options'] = options
                follow_up['correct'] = correct_index
            else:
                follow_up['questionFormat'] = 'text_answer'
        
        elif new_format == 'fill_in_blank':
            key_words = extract_key_words(lesson_text)
            if key_words:
                key_word = random.choice(key_words[:10])
                blank_text = create_fill_in_blank(lesson_text, key_word)
                if blank_text:
                    follow_up['question'] = blank_text
                    follow_up['correct_answer'] = key_word
                else:
                    follow_up['questionFormat'] = 'text_answer'
            else:
                follow_up['questionFormat'] = 'text_answer'
    
    # Process quiz questions
    quiz = content.get('quiz', {})
    quiz_questions = quiz.get('questions', [])
    for i, question in enumerate(quiz_questions):
        question_text = question.get('question', '')
        current_type = question.get('type', 'text_answer')
        
        new_format = assign_question_format(question_text, lesson_text, i + len(tasks) + len(follow_ups), len(quiz_questions) + len(tasks) + len(follow_ups))
        question['type'] = new_format
        
        if new_format == 'multiple_choice':
            key_words = extract_key_words(question_text + ' ' + lesson_text)
            if key_words:
                correct_answer = random.choice(key_words[:5])
                options, correct_index = generate_mcq_options(correct_answer, lesson_text)
                question['options'] = options
                question['correct'] = correct_index
            else:
                question['type'] = 'text_answer'
        
        elif new_format == 'fill_in_blank':
            key_words = extract_key_words(lesson_text)
            if key_words:
                key_word = random.choice(key_words[:10])
                blank_text = create_fill_in_blank(lesson_text, key_word)
                if blank_text:
                    question['question'] = blank_text
                    question['correct_answer'] = key_word
                else:
                    question['type'] = 'text_answer'
            else:
                question['type'] = 'text_answer'
    
    return lesson_data

def main():
    """Read SQL file, process lessons, and update"""
    import sys
    
    sql_file = 'COMPLETE_ALL_46_LESSONS.sql'
    
    # Read the SQL file
    with open(sql_file, 'r') as f:
        content = f.read()
    
    # Find all INSERT statements
    import re
    pattern = r"INSERT INTO lessons.*?'({.*?})'::jsonb"
    matches = re.findall(pattern, content, re.DOTALL)
    
    print(f"Found {len(matches)} lessons to process")
    
    # Process each lesson
    updated_lessons = []
    for i, json_str in enumerate(matches, 1):
        try:
            json_clean = json_str.replace("''", "'")
            lesson_data = json.loads(json_clean)
            
            # Extract the full INSERT line to get metadata
            insert_pattern = r"\(('[^']+',\s*\d+,\s*'[^']+'.*?)'({.*?})'::jsonb\)"
            full_match = re.search(insert_pattern, content, re.DOTALL)
            
            # Process the lesson
            processed = process_lesson({'content': lesson_data})
            updated_lessons.append((i, processed['content']))
            
            print(f"Processed lesson {i}")
        except Exception as e:
            print(f"Error processing lesson {i}: {e}")
            continue
    
    print(f"\nProcessed {len(updated_lessons)} lessons")
    print("Note: This script shows the processing logic. To actually update the SQL file,")
    print("you'll need to integrate this into the comprehensive_parser.py or create a separate update script.")

if __name__ == '__main__':
    main()

