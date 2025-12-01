#!/usr/bin/env python3
"""
Script to update COMPLETE_ALL_46_LESSONS.sql with varied question types:
- Multiple choice (MCQ)
- Text answer (type in)
- Fill in the blank

Reads the SQL file, processes each lesson, and updates question formats intelligently.
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
    r'\b(artery|vein|capillary|nerve|neuron|synapse|hormone|enzyme|antibody|antigen)\b',
    r'\b(bones|muscles|joints|spine|skull|ribs|femur|pelvis|cartilage|ligament)\b',
    r'\b(doctor|nurse|pharmacist|technician|specialist|surgeon|pediatrician)\b'
]

def extract_key_words(text):
    """Extract important medical/biology terms from text"""
    if not text:
        return []
    
    key_words = []
    text_lower = text.lower()
    
    for pattern in KEY_WORD_PATTERNS:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        key_words.extend(matches)
    
    # Also look for capitalized words (likely proper nouns or important terms)
    capitalized = re.findall(r'\b[A-Z][a-z]+\b', text)
    key_words.extend([w.lower() for w in capitalized if w.lower() not in FILLER_WORDS and len(w) > 3])
    
    # Count frequency and return most common
    word_counts = Counter(key_words)
    # Return words that appear at least once and are not fillers
    important_words = [word for word, count in word_counts.items() 
                      if word.lower() not in FILLER_WORDS and len(word) > 3]
    
    return list(set(important_words))  # Remove duplicates

def create_fill_in_blank(text, key_word):
    """Create a fill-in-the-blank question by removing a key word"""
    if not text or not key_word:
        return None
    
    # Find sentences containing the key word
    sentences = re.split(r'[.!?]+', text)
    target_sentence = None
    
    for sentence in sentences:
        if re.search(r'\b' + re.escape(key_word) + r'\b', sentence, re.IGNORECASE):
            target_sentence = sentence.strip()
            if len(target_sentence) > 20:  # Make sure sentence is substantial
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
        # Use generic wrong answers based on context
        if 'system' in correct_answer.lower() or 'organ' in correct_answer.lower():
            generic_wrong = ['muscle', 'tissue', 'cell', 'bone']
        elif 'doctor' in correct_answer.lower() or 'nurse' in correct_answer.lower():
            generic_wrong = ['patient', 'hospital', 'clinic', 'medicine']
        else:
            generic_wrong = ['incorrect', 'wrong', 'false', 'none']
        wrong_options = generic_wrong[:num_options - 1]
    
    options.extend(wrong_options)
    
    # Shuffle but remember correct index
    correct_index = 0
    random.shuffle(options)
    correct_index = options.index(correct_answer)
    
    return options, correct_index

def assign_question_format(question_text, lesson_text, question_index, total_questions):
    """Intelligently assign question format - mix of types"""
    # Mix of formats: ~40% text_answer, ~30% multiple_choice, ~30% fill_in_blank
    # Use question index to distribute evenly
    format_ratio = question_index % 10
    
    if format_ratio < 4:
        return 'text_answer'
    elif format_ratio < 7:
        return 'multiple_choice'
    else:
        return 'fill_in_blank'

def process_question(question, lesson_text, question_index, total_questions):
    """Process a single question and assign format"""
    question_text = question.get('question', '')
    current_format = question.get('questionFormat') or question.get('type', 'text_answer')
    
    # Assign new format
    new_format = assign_question_format(question_text, lesson_text, question_index, total_questions)
    
    # Update format field (use 'type' for quiz, 'questionFormat' for tasks/followups)
    if 'type' in question:
        question['type'] = new_format
    else:
        question['questionFormat'] = new_format
    
    if new_format == 'multiple_choice':
        # Extract a key term from the question or text
        key_words = extract_key_words(question_text + ' ' + lesson_text)
        if key_words:
            correct_answer = random.choice(key_words[:5])  # Pick from top 5
            options, correct_index = generate_mcq_options(correct_answer, lesson_text)
            question['options'] = options
            question['correct'] = correct_index
        else:
            # Fallback to text_answer if we can't generate good options
            if 'type' in question:
                question['type'] = 'text_answer'
            else:
                question['questionFormat'] = 'text_answer'
    
    elif new_format == 'fill_in_blank':
        # Find a key word to remove
        key_words = extract_key_words(lesson_text)
        if key_words:
            key_word = random.choice(key_words[:10])  # Pick from top 10
            blank_text = create_fill_in_blank(lesson_text, key_word)
            if blank_text:
                question['question'] = blank_text
                question['correct_answer'] = key_word
            else:
                # Fallback to text_answer
                if 'type' in question:
                    question['type'] = 'text_answer'
                else:
                    question['questionFormat'] = 'text_answer'
        else:
            if 'type' in question:
                question['type'] = 'text_answer'
            else:
                question['questionFormat'] = 'text_answer'
    
    return question

def main():
    """Read SQL file, process lessons, and write updated version"""
    sql_file = 'COMPLETE_ALL_46_LESSONS.sql'
    output_file = 'COMPLETE_ALL_46_LESSONS.sql'
    
    # Read the SQL file
    with open(sql_file, 'r') as f:
        content = f.read()
    
    # Find all INSERT statements with their JSON content
    pattern = r"(INSERT INTO lessons.*?VALUES\s*\()([^)]+)(')({.*?})('::jsonb\);)"
    matches = list(re.finditer(pattern, content, re.DOTALL))
    
    print(f"Found {len(matches)} lessons to process\n")
    
    updated_content = content
    offset = 0
    
    # Process each lesson in reverse order to maintain string positions
    for match in reversed(matches):
        try:
            # Extract the JSON part
            json_str = match.group(4)
            json_clean = json_str.replace("''", "'")
            lesson_data = json.loads(json_clean)
            
            lesson_text = lesson_data.get('text', '')
            
            # Process tasks
            tasks = lesson_data.get('tasks', [])
            total_questions = len(tasks) + len(lesson_data.get('followUps', [])) + len(lesson_data.get('quiz', {}).get('questions', []))
            
            for i, task in enumerate(tasks):
                process_question(task, lesson_text, i, total_questions)
            
            # Process follow-ups
            follow_ups = lesson_data.get('followUps', [])
            for i, follow_up in enumerate(follow_ups):
                process_question(follow_up, lesson_text, len(tasks) + i, total_questions)
            
            # Process quiz questions
            quiz = lesson_data.get('quiz', {})
            quiz_questions = quiz.get('questions', [])
            for i, question in enumerate(quiz_questions):
                process_question(question, lesson_text, len(tasks) + len(follow_ups) + i, total_questions)
            
            # Convert back to JSON string
            new_json = json.dumps(lesson_data, ensure_ascii=False).replace("'", "''")
            
            # Replace in content
            start_pos = match.start(4) + offset
            end_pos = match.end(4) + offset
            updated_content = updated_content[:start_pos] + new_json + updated_content[end_pos:]
            offset += len(new_json) - len(json_str)
            
            # Get lesson title for logging
            title_match = re.search(r"title.*?'([^']+)'", match.group(0))
            title = title_match.group(1) if title_match else "Unknown"
            print(f"✓ Processed: {title[:50]}")
            
        except Exception as e:
            print(f"❌ Error processing lesson: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    # Write updated file
    with open(output_file, 'w') as f:
        f.write(updated_content)
    
    print(f"\n✅ Updated {sql_file} with varied question types!")
    print("Now re-import the SQL file into Supabase.")

if __name__ == '__main__':
    main()

