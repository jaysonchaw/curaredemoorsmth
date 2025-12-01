#!/usr/bin/env python3
"""
Comprehensive RTF parser - extracts ALL content with proper quiz questions
Generates real multiple choice questions with options based on lesson content
"""

import re
import json
import random

def clean_rtf(text):
    """Clean RTF formatting"""
    if not text:
        return ""
    
    # Handle Unicode escapes
    text = re.sub(r'\\uc0\\u(\d+)', lambda m: chr(int(m.group(1))), text)
    
    # Handle special characters
    char_map = {
        '92': "'", '96': '-', '93': '"', '94': '"',
        '8217': "'", '8216': "'", '8220': '"', '8221': '"',
        '8211': '–', '8212': '—', '8230': '...', '8594': '→'
    }
    text = re.sub(r"\\'(\d+)", lambda m: char_map.get(m.group(1), ''), text)
    
    # Remove RTF codes but preserve structure
    text = re.sub(r'\\[a-z]+\d*\s*', ' ', text)
    text = re.sub(r'\{|\}', '', text)
    text = re.sub(r'\\\s*\n', ' ', text)  # Replace backslash line breaks with space
    text = re.sub(r'\\', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()

def extract_section_text(content, start_marker, end_markers):
    """Extract text between start_marker and any end_marker"""
    start_match = re.search(start_marker, content, re.IGNORECASE)
    if not start_match:
        return None
    
    start_pos = start_match.end()
    
    # Find earliest end marker
    end_pos = len(content)
    for end_marker in end_markers:
        end_match = re.search(end_marker, content[start_pos:], re.IGNORECASE)
        if end_match and end_match.start() < end_pos:
            end_pos = end_match.start()
    
    section_text = content[start_pos:start_pos + end_pos]
    # Don't clean yet - return raw for extract_bullets to handle Med RTF format
    return section_text

def extract_bullets(text):
    """Extract bullet points, stopping at section headers. Handles both Pre-Med and Med RTF formats."""
    bullets = []
    # Stop at section headers
    section_headers = ['Key Points:', 'More to Learn:', 'Skill Check:', 'Questions:', 'Starter Questions:']
    
    # Find where to stop
    stop_pos = len(text)
    for header in section_headers:
        header_match = re.search(re.escape(header), text, re.IGNORECASE)
        if header_match and header_match.start() < stop_pos:
            stop_pos = header_match.start()
    
    # Extract only up to the stop position
    text_to_parse = text[:stop_pos]
    
    # First, try Med RTF format: questions separated by ?\ or !\ or just \ (for statements)
    # Format 1: "question?\\question?\\question?"
    # Format 2: "statement.\\statement.\\statement." (Skill Check format)
    question_parts = re.split(r'([?!])\\', text_to_parse)
    med_questions_found = False
    if len(question_parts) > 3:  # More than just the original text
        # Reconstruct questions by pairing chunks with their punctuation
        i = 0
        while i < len(question_parts) - 1:
            question_text = question_parts[i]
            if i + 1 < len(question_parts) and question_parts[i + 1] in ['?', '!']:
                # This chunk ends with ? or !, combine with punctuation
                question = question_text + question_parts[i + 1]
                # Clean it - handle RTF codes
                question = re.sub(r'\\uc0\\u(\d+)', lambda m: chr(int(m.group(1))), question)
                question = re.sub(r'\\uc0\\u9679\s*', '', question)  # Remove bullet markers
                question = re.sub(r'\\[a-z]+\d*\s*', ' ', question)
                question = re.sub(r'\{|\}', '', question)
                question = re.sub(r'\\\s*\n', ' ', question)
                question = re.sub(r'\\', ' ', question)
                question = re.sub(r'\s+', ' ', question).strip()
                # Remove leading bullet characters if any
                question = re.sub(r'^[•\u9679●\s]+', '', question)
                # Skip if it contains section headers or is too short
                if question and len(question) > 10:
                    # Check if it contains section headers (case-insensitive)
                    contains_header = False
                    for header in section_headers:
                        if header.lower() in question.lower():
                            contains_header = True
                            break
                    if not contains_header:
                        bullets.append(question)
                        med_questions_found = True
                i += 2
            else:
                i += 1
    
    # Also try Med RTF format where questions/statements are separated by \ (backslash-newline)
    # This is common in Skill Check sections where questions end with periods
    if not med_questions_found:
        # Split by backslash followed by newline or end of text
        # Look for patterns like: "text.\text.\text."
        lines = re.split(r'\\\s*\n', text_to_parse)
        potential_questions = []
        current_question = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Clean the line
            line = re.sub(r'\\uc0\\u(\d+)', lambda m: chr(int(m.group(1))), line)
            line = re.sub(r'\\uc0\\u9679\s*', '', line)
            line = re.sub(r'\\[a-z]+\d*\s*', ' ', line)
            line = re.sub(r'\{|\}', '', line)
            line = re.sub(r'\\', ' ', line)
            line = re.sub(r'\s+', ' ', line).strip()
            line = re.sub(r'^[•\u9679●\s]+', '', line)
            
            if not line or len(line) < 5:
                continue
            
            # If line ends with . ? or !, it might be a complete question
            if line.endswith(('.', '?', '!')):
                if current_question:
                    current_question += " " + line
                else:
                    current_question = line
                
                # Check if it's substantial and not a section header
                if len(current_question) > 20:
                    contains_header = False
                    for header in section_headers:
                        if header.lower() in current_question.lower():
                            contains_header = True
                            break
                    if not contains_header:
                        potential_questions.append(current_question)
                current_question = ""
            else:
                # Continue building the question
                if current_question:
                    current_question += " " + line
                else:
                    current_question = line
        
        # Add any remaining question
        if current_question and len(current_question) > 20:
            contains_header = False
            for header in section_headers:
                if header.lower() in current_question.lower():
                    contains_header = True
                    break
            if not contains_header:
                potential_questions.append(current_question)
        
        if len(potential_questions) > 0:
            bullets.extend(potential_questions)
            med_questions_found = True
    
    # If Med format didn't work, try Pre-Med format (traditional bullets on cleaned text)
    if not med_questions_found:
        # Clean the text first for Pre-Med format
        cleaned_text = clean_rtf(text_to_parse)
        # Try the traditional bullet pattern
        pattern = r'[•\u9679●]\s*([^\n•\u9679●]+)'
        matches = re.findall(pattern, cleaned_text)
        for match in matches:
            cleaned = match.strip()
            # Skip if empty, too short, or contains section headers
            if not cleaned or len(cleaned) < 5:
                continue
            if any(header.lower() in cleaned.lower() for header in section_headers):
                continue
            bullets.append(cleaned)
    
    # Remove duplicates while preserving order, and filter out non-questions
    seen = set()
    unique_bullets = []
    for bullet in bullets:
        # Skip if it's just bullet markers or too short
        if not bullet or len(bullet.strip()) < 10:
            continue
        # Skip if it's just whitespace or bullet characters
        if re.match(r'^[\s•\u9679●]+$', bullet):
            continue
        # Normalize for comparison (remove extra spaces, bullet chars)
        normalized = re.sub(r'[•\u9679●\s]+', ' ', bullet.strip())
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        if normalized and normalized not in seen:
            seen.add(normalized)
            unique_bullets.append(bullet.strip())
    
    return unique_bullets

def determine_question_type(question_text):
    """Determine the best question type based on question content"""
    question_lower = question_text.lower()
    
    # Fill in the blank indicators
    fill_blank_keywords = ['______', 'fill in', 'blank', 'complete the', 'missing word']
    if any(keyword in question_lower or keyword in question_text for keyword in fill_blank_keywords):
        return "fill_in_blank"
    
    # Drag and drop indicators
    drag_drop_keywords = ['order', 'sequence', 'arrange', 'put in order', 'match', 'connect', 'pair', 'label', 'drag', 'drop']
    if any(keyword in question_lower for keyword in drag_drop_keywords):
        return "drag_drop"
    
    # Multiple choice indicators (questions with "which", "what" that suggest selection)
    mc_keywords = ['which of the following', 'which one', 'select', 'choose', 'pick']
    if any(keyword in question_lower for keyword in mc_keywords):
        return "multiple_choice"
    
    # Text answer indicators (open-ended questions)
    text_answer_keywords = ['explain', 'describe', 'list', 'name', 'how does', 'why', 'in your own words', 'give an example', 'what do you think', 'can you']
    if any(keyword in question_lower for keyword in text_answer_keywords):
        return "text_answer"
    
    # If it ends with a question mark and is short, likely multiple choice
    if question_text.strip().endswith('?') and len(question_text) < 100:
        return "multiple_choice"
    
    # Default to text answer for open-ended questions
    return "text_answer"

def extract_key_words_for_fill_blank(text):
    """Extract key medical/biology terms suitable for fill-in-the-blank"""
    if not text:
        return []
    
    # Medical/biology key words
    key_word_patterns = [
        r'\b(heart|brain|lungs|stomach|kidney|liver|muscle|bone|cell|tissue|organ|system)\b',
        r'\b(blood|oxygen|carbon|dioxide|nutrient|waste|energy|protein|vitamin|mineral)\b',
        r'\b(circulatory|respiratory|digestive|nervous|skeletal|muscular|immune|endocrine)\b',
        r'\b(artery|vein|capillary|nerve|neuron|hormone|enzyme|antibody)\b'
    ]
    
    key_words = []
    text_lower = text.lower()
    
    for pattern in key_word_patterns:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        key_words.extend(matches)
    
    # Remove duplicates and filter out common words
    filler_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'}
    key_words = [w for w in set(key_words) if w.lower() not in filler_words and len(w) > 3]
    
    return key_words[:10]  # Return top 10

def create_fill_in_blank_from_text(text, key_word):
    """Create a fill-in-the-blank question by removing a key word from text"""
    if not text or not key_word:
        return None
    
    # Find sentences containing the key word
    sentences = re.split(r'[.!?]+', text)
    target_sentence = None
    
    for sentence in sentences:
        if re.search(r'\b' + re.escape(key_word) + r'\b', sentence, re.IGNORECASE):
            target_sentence = sentence.strip()
            if len(target_sentence) > 20 and len(target_sentence) < 200:
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

def extract_answer_from_content(question, lesson_content):
    """Extract a concise answer from lesson content based on the question"""
    question_lower = question.lower()
    content_lower = lesson_content.lower()
    sentences = re.split(r'[.!?]+', lesson_content)
    
    # Look for concise answers (shorter sentences are better for multiple choice)
    answer_candidates = []
    
    # System-related questions - look for concise definitions
    if any(term in question_lower for term in ['system', 'systems']):
        if 'skeletal' in question_lower or 'bone' in question_lower:
            for sent in sentences:
                sent_lower = sent.lower()
                if 'skeletal' in sent_lower and ('provides' in sent_lower or 'protects' in sent_lower or 'supports' in sent_lower):
                    # Extract key phrase
                    if len(sent) < 120:
                        answer_candidates.append(sent.strip())
        elif 'circulatory' in question_lower or 'heart' in question_lower or 'blood' in question_lower:
            for sent in sentences:
                sent_lower = sent.lower()
                if any(term in sent_lower for term in ['circulatory', 'heart', 'blood']) and ('pumps' in sent_lower or 'transports' in sent_lower or 'delivers' in sent_lower):
                    if len(sent) < 120:
                        answer_candidates.append(sent.strip())
        elif 'respiratory' in question_lower or 'lung' in question_lower or 'breath' in question_lower:
            for sent in sentences:
                sent_lower = sent.lower()
                if any(term in sent_lower for term in ['respiratory', 'lung', 'breath']) and ('oxygen' in sent_lower or 'breathe' in sent_lower):
                    if len(sent) < 120:
                        answer_candidates.append(sent.strip())
        elif 'work together' in question_lower or 'cooperate' in question_lower:
            for sent in sentences:
                sent_lower = sent.lower()
                if any(term in sent_lower for term in ['work together', 'cooperate', 'collaborate']) and len(sent) < 100:
                    answer_candidates.append(sent.strip())
    
    # Organ-related questions
    elif 'organ' in question_lower:
        for sent in sentences:
            if 'organ' in sent.lower() and len(sent) > 20 and len(sent) < 100:
                answer_candidates.append(sent.strip())
    
    # Cell-related questions
    elif 'cell' in question_lower:
        for sent in sentences:
            if 'cell' in sent.lower() and ('building block' in sent.lower() or 'basic' in sent.lower()) and len(sent) < 100:
                answer_candidates.append(sent.strip())
    
    # General: find concise sentences with question keywords
    question_words = [w for w in question_lower.split() if len(w) > 4 and w not in ['what', 'which', 'where', 'when', 'why', 'how', 'does', 'doesn', 'would', 'could', 'should', 'think', 'about']]
    for word in question_words[:2]:  # Check first 2 meaningful words
        for sent in sentences:
            if word in sent.lower() and len(sent) > 20 and len(sent) < 100:
                answer_candidates.append(sent.strip())
    
    # Return the shortest good candidate (more concise)
    if answer_candidates:
        # Sort by length, prefer shorter
        answer_candidates.sort(key=len)
        return answer_candidates[0]
    
    return None

def generate_multiple_choice_options(question, lesson_content):
    """Generate realistic multiple choice options with actual answers from lesson content"""
    question_lower = question.lower()
    content_lower = lesson_content.lower()
    
    # For specific question types, generate targeted answers FIRST
    correct_answer = None
    
    # Hospital/healthcare professional questions - generate specific answer
    if 'hospital' in question_lower or 'people you might meet' in question_lower or 'healthcare professional' in question_lower:
        # Extract specific professionals mentioned in content
        professionals = []
        if 'nurse' in content_lower:
            professionals.append('Nurses')
        if 'pharmacist' in content_lower:
            professionals.append('Pharmacists')
        if 'doctor' in content_lower or 'pediatrician' in content_lower:
            professionals.append('Doctors')
        if 'surgeon' in content_lower:
            professionals.append('Surgeons')
        if 'technician' in content_lower:
            professionals.append('Lab technicians')
        
        if professionals:
            correct_answer = f"{', '.join(professionals[:3])} work in hospitals"
        else:
            correct_answer = "Doctors, nurses, and healthcare professionals"
    
    # If not a hospital question, try to extract from content
    if not correct_answer:
        correct_answer = extract_answer_from_content(question, lesson_content)
    
    # If we couldn't extract, try harder to find concise answer in content
    if not correct_answer or len(correct_answer) < 15:
        sentences = re.split(r'[.!?]+', lesson_content)
        question_keywords = [w for w in question_lower.split() if len(w) > 3 and w not in ['what', 'which', 'where', 'when', 'why', 'how', 'does', 'doesn', 'would', 'could', 'should', 'think', 'about', 'from', 'this', 'that', 'the', 'and', 'or', 'but']]
        
        # Find concise sentences with keyword overlap
        best_sentences = []
        for sent in sentences:
            if len(sent) > 15 and len(sent) < 100:  # Prefer shorter
                sent_lower = sent.lower()
                overlap = sum(1 for kw in question_keywords if kw in sent_lower)
                if overlap > 0:
                    best_sentences.append((overlap, len(sent), sent.strip()))
        
        # Sort by overlap (desc) then length (asc) - prefer high overlap, short sentences
        best_sentences.sort(reverse=True, key=lambda x: (x[0], -x[1]))
        if best_sentences and best_sentences[0][0] > 0:
            correct_answer = best_sentences[0][2][:100]  # Limit to 100 chars
    
    # Final fallback: generate concise answer based on question type
    if not correct_answer or len(correct_answer) < 15:
        if "system" in question_lower:
            if "skeletal" in question_lower or "bone" in question_lower:
                correct_answer = "Provides structure and protects organs"
            elif "muscular" in question_lower or "muscle" in question_lower:
                correct_answer = "Enables movement and supports the body"
            elif "circulatory" in question_lower or "heart" in question_lower or "blood" in question_lower:
                correct_answer = "Transports oxygen and nutrients throughout the body"
            elif "respiratory" in question_lower or "lung" in question_lower or "breath" in question_lower:
                correct_answer = "Brings in oxygen and removes carbon dioxide"
            elif "nervous" in question_lower or "brain" in question_lower or "nerve" in question_lower:
                correct_answer = "Controls body functions and processes information"
            elif "digestive" in question_lower or "stomach" in question_lower:
                correct_answer = "Breaks down food and absorbs nutrients"
            else:
                correct_answer = "Body systems work together to maintain health"
        elif "organ" in question_lower:
            if "heart" in question_lower:
                correct_answer = "Pumps blood throughout the body"
            elif "lung" in question_lower:
                correct_answer = "Exchanges oxygen and carbon dioxide"
            elif "brain" in question_lower:
                correct_answer = "Controls thoughts, movements, and body functions"
            else:
                correct_answer = "Structures made of tissues that perform specific functions"
        elif "cell" in question_lower:
            correct_answer = "The basic building blocks of all living things"
        elif "work together" in question_lower or "collaborate" in question_lower:
            correct_answer = "Systems must cooperate to keep the body healthy"
        elif "why" in question_lower:
            # Try to find a "because" or reason in the content
            for sent in re.split(r'[.!?]+', lesson_content):
                if 'because' in sent.lower() or 'reason' in sent.lower() or 'important' in sent.lower():
                    if len(sent) > 30 and len(sent) < 200:
                        correct_answer = sent.strip()[:150]
                        break
            if not correct_answer or len(correct_answer) < 20:
                correct_answer = "This is important for maintaining proper body function"
        else:
            # Try to find any relevant sentence
            sentences = re.split(r'[.!?]+', lesson_content)
            for sent in sentences:
                # Check if sentence contains words from the question
                question_words = [w for w in question_lower.split() if len(w) > 4]
                if any(word in sent.lower() for word in question_words[:2]) and len(sent) > 30 and len(sent) < 200:
                    correct_answer = sent.strip()[:150]
                    break
            if not correct_answer or len(correct_answer) < 20:
                correct_answer = "This concept is essential for understanding how the body works"
    
    # Generate plausible wrong answers that are related but incorrect
    wrong_answers = []
    
    # Hospital/healthcare professional questions - specific wrong answers
    if 'hospital' in question_lower or 'people you might meet' in question_lower or 'healthcare professional' in question_lower:
        wrong_answers = [
            "Only doctors work in hospitals",
            "Hospitals don't have different types of staff",
            "Patients are the only people in hospitals"
        ]
    # System-related wrong answers
    elif "system" in question_lower or any(sys in question_lower for sys in ['skeletal', 'muscular', 'circulatory', 'respiratory', 'nervous', 'digestive']):
        systems = ["Skeletal", "Muscular", "Circulatory", "Respiratory", "Nervous", "Digestive"]
        # Find systems mentioned in content but not in correct answer
        for sys in systems:
            if sys.lower() in content_lower and sys.lower() not in correct_answer.lower():
                if "work together" in question_lower or "cooperate" in question_lower:
                    wrong_answers.append(f"The {sys} system functions independently")
                else:
                    wrong_answers.append(f"The {sys} system is not involved")
                if len(wrong_answers) >= 3:
                    break
        
        # Add generic but plausible wrong answers
        if len(wrong_answers) < 3:
            wrong_answers.extend([
                "Each system works in isolation",
                "Only one system is active at a time",
                "Systems don't need to communicate"
            ])
    # Organ-related wrong answers
    elif "organ" in question_lower or any(org in question_lower for org in ['heart', 'lung', 'brain', 'stomach', 'kidney', 'liver']):
        organs = ["Heart", "Lungs", "Brain", "Stomach", "Kidneys", "Liver"]
        for org in organs:
            if org.lower() in content_lower and org.lower() not in correct_answer.lower():
                wrong_answers.append(f"The {org} has a different function")
                if len(wrong_answers) >= 3:
                    break
        
        if len(wrong_answers) < 3:
            wrong_answers.extend([
                "Organs function independently",
                "Only one organ is necessary",
                "Organs don't need to work together"
            ])
    # Cell/tissue related
    elif "cell" in question_lower or "tissue" in question_lower:
        wrong_answers = [
            "Cells function independently",
            "Tissues are not made of cells",
            "Cells don't form organs"
        ]
    # General wrong answers - make them concise and topic-specific
    else:
        # Create concise wrong answers based on question topic
        if 'why' in question_lower:
            wrong_answers = [
                "This is not important",
                "This doesn't affect the body",
                "This only happens sometimes"
            ]
        elif 'what' in question_lower or 'which' in question_lower:
            wrong_answers = [
                "This is not correct",
                "This doesn't apply here",
                "This is unrelated"
            ]
        else:
            wrong_answers = [
                "This concept is not important",
                "This doesn't apply to the body",
                "This is only sometimes true"
            ]
    
    # Filter to ensure wrong answers are different from correct
    filtered_wrong = []
    for w in wrong_answers:
        if w.lower() != correct_answer.lower() and w not in filtered_wrong:
            filtered_wrong.append(w)
            if len(filtered_wrong) >= 3:
                break
    
    # Ensure we have 3 wrong answers
    while len(filtered_wrong) < 3:
        filtered_wrong.append("This is not correct")
    
    # Limit all answers to 80 characters for readability
    correct_answer = correct_answer[:80] if len(correct_answer) > 80 else correct_answer
    filtered_wrong = [w[:80] if len(w) > 80 else w for w in filtered_wrong[:3]]
    
    # Combine and shuffle
    options = [correct_answer] + filtered_wrong
    random.shuffle(options)
    correct_index = options.index(correct_answer)
    
    return options, correct_index

def generate_explanation(question, lesson_content, correct_answer=None):
    """Generate a real explanation for the answer based on lesson content"""
    question_lower = question.lower()
    content_lower = lesson_content.lower()
    
    # Try to find explanation in lesson content
    sentences = re.split(r'[.!?]+', lesson_content)
    
    # Look for sentences that explain the concept
    explanation_candidates = []
    
    # Find sentences that contain key terms from the question
    question_keywords = [w for w in question_lower.split() if len(w) > 4 and w not in ['what', 'which', 'where', 'when', 'why', 'how', 'does', 'doesn', 'would', 'could', 'should', 'think', 'about']]
    
    for keyword in question_keywords[:3]:
        for sent in sentences:
            if keyword in sent.lower() and len(sent) > 40 and len(sent) < 250:
                # Check if it's explanatory (contains words like "because", "helps", "allows", "enables")
                if any(word in sent.lower() for word in ['because', 'helps', 'allows', 'enables', 'important', 'essential', 'function', 'works', 'provides']):
                    explanation_candidates.append(sent.strip())
    
    # If we found good explanations, use the first one
    if explanation_candidates:
        explanation = explanation_candidates[0]
        # Clean it up
        explanation = re.sub(r'\s+', ' ', explanation).strip()
        if len(explanation) > 30:
            return explanation[:200]  # Limit length
    
    # Generate explanation based on question type
    if "system" in question_lower:
        if "skeletal" in question_lower:
            return "The skeletal system provides the body's framework, protects internal organs, and works with muscles to enable movement."
        elif "circulatory" in question_lower or "heart" in question_lower:
            return "The circulatory system pumps blood throughout the body, delivering oxygen and nutrients to cells while removing waste products."
        elif "respiratory" in question_lower or "lung" in question_lower:
            return "The respiratory system brings oxygen into the body and removes carbon dioxide, working closely with the circulatory system."
        elif "nervous" in question_lower or "brain" in question_lower:
            return "The nervous system controls all body functions, processes sensory information, and coordinates responses through the brain and nerves."
        else:
            return "Body systems work together to maintain health. Each system has specific functions but they must cooperate for the body to function properly."
    elif "organ" in question_lower:
        if "heart" in question_lower:
            return "The heart is a muscular organ that pumps blood throughout the body, delivering oxygen and nutrients to all cells."
        elif "lung" in question_lower:
            return "The lungs are organs that exchange oxygen and carbon dioxide with the blood, essential for breathing."
        elif "brain" in question_lower:
            return "The brain is the control center of the nervous system, processing information and controlling body functions."
        else:
            return "Organs are structures made of different tissues that work together to perform specific functions in the body."
    elif "cell" in question_lower:
        return "Cells are the smallest units of life. They combine to form tissues, which form organs, which form systems."
    elif "work together" in question_lower:
        return "Body systems must work together because each system depends on others. For example, the respiratory and circulatory systems work together to deliver oxygen to cells."
    else:
        # Generic but helpful explanation
        return "This concept is important for understanding how the human body functions and maintains health."

def extract_drag_drop_items(question_text, lesson_text_parts):
    """Extract items for drag and drop questions"""
    items = []
    full_text = ' '.join(lesson_text_parts).lower()
    
    # Look for common medical/anatomy terms in question
    medical_terms = ['heart', 'lungs', 'brain', 'stomach', 'kidneys', 'liver', 'blood', 'oxygen', 
                     'carbon dioxide', 'arteries', 'veins', 'nerves', 'muscles', 'bones', 'cells', 
                     'tissues', 'organs', 'skeletal', 'muscular', 'circulatory', 'respiratory', 
                     'nervous', 'digestive']
    
    for term in medical_terms:
        if term in question_text.lower() and term in full_text:
            items.append(term.capitalize())
    
    # If not enough items, add generic ones
    if len(items) < 2:
        items = ["Item 1", "Item 2", "Item 3", "Item 4"]
    
    return items[:6]  # Max 6 items

def parse_rtf_file(filepath, path_type, num_lessons):
    """Parse RTF file and extract all lessons with complete content"""
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    lessons = []
    
    for lesson_num in range(1, num_lessons + 1):
        print(f"\nProcessing {path_type} Lesson {lesson_num}...")
        
        # Find lesson title
        title_pattern1 = rf'\\fs51\\fsmilli25995\s+\\cf2\s+{lesson_num}\s+\|\s+(.*?)(?=\\fs21|\\fs51)'
        title_pattern2 = rf'\\fs51\\fsmilli25995\s+{lesson_num}\s+\|\s+(.*?)(?=\\fs21|\\fs51)'
        title_match = re.search(title_pattern1, content, re.DOTALL) or re.search(title_pattern2, content, re.DOTALL)
        
        if not title_match:
            print(f"  ⚠ Warning: Lesson {lesson_num} title not found")
            continue
        
        title = clean_rtf(title_match.group(1))
        print(f"  Title: {title}")
        
        start_pos = title_match.start()
        
        # Find next lesson
        next_pattern1 = rf'\\fs51\\fsmilli25995\s+\\cf2\s+{lesson_num + 1}\s+\|'
        next_pattern2 = rf'\\fs51\\fsmilli25995\s+{lesson_num + 1}\s+\|'
        next_match = re.search(next_pattern1, content[start_pos:]) or re.search(next_pattern2, content[start_pos:])
        end_pos = start_pos + next_match.start() if next_match else len(content)
        
        lesson_block = content[start_pos:end_pos]
        
        # Extract objective
        obj_match = re.search(r'After this lesson.*?(?=\\fs51|$)', lesson_block, re.DOTALL | re.IGNORECASE)
        objective = clean_rtf(obj_match.group(0)) if obj_match else f"Learn about {title}"
        if len(objective) > 500:
            objective = objective[:497] + "..."
        print(f"  Objective: {objective[:80]}...")
        
        # Extract main lesson text - get intro paragraph
        lesson_text_parts = []
        intro_match = re.search(rf'In this lesson.*?(?=After this lesson|Lesson {lesson_num}:|Starter Questions:)', lesson_block, re.DOTALL | re.IGNORECASE)
        if intro_match:
            intro_text = clean_rtf(intro_match.group(0))
            if intro_text and len(intro_text) > 20:
                lesson_text_parts.append(intro_text)
        
        # Get the "Lesson X: ..." main content
        lesson_text_pattern = rf'Lesson {lesson_num}:(.*?)(?=Starter Questions:|Key Points:|Questions:|More to Learn:|Skill Check:|\\fs51)'
        lesson_text_match = re.search(lesson_text_pattern, lesson_block, re.DOTALL | re.IGNORECASE)
        if lesson_text_match:
            lesson_text_raw = lesson_text_match.group(1)
            lesson_text_raw = re.sub(r'\\\s*\n', ' ', lesson_text_raw)
            lesson_text = clean_rtf(lesson_text_raw)
            if lesson_text and len(lesson_text) > 20:
                lesson_text_parts.append(lesson_text)
        
        # Extract Starter Questions
        tasks = []
        starter_text = extract_section_text(lesson_block, r'Starter Questions:', [r'Key Points:', r'Questions:', r'More to Learn:', r'Skill Check:'])
        if starter_text:
            # Extract bullets from raw RTF text (extract_bullets will handle cleaning)
            task_list = extract_bullets(starter_text)
            for i, task in enumerate(task_list):
                # Assign question type with variety: mix of text_answer, multiple_choice, fill_in_blank
                # Use index to distribute evenly: 0,3,6 = text, 1,4,7 = mcq, 2,5,8 = fill_blank
                if i % 3 == 0:
                    question_type = "text_answer"
                elif i % 3 == 1:
                    question_type = "multiple_choice"
                else:
                    question_type = "fill_in_blank"
                
                # Override with intelligent detection if it's clearly a specific type
                detected_type = determine_question_type(task)
                if detected_type in ["drag_drop", "fill_in_blank"]:
                    question_type = detected_type
                
                task_data = {
                    "id": i + 1,
                    "type": "interactive",
                    "question": task,
                    "questionFormat": question_type,
                    "hint": "Think about the key points from this lesson."
                }
                
                if question_type == "drag_drop":
                    task_data["items"] = extract_drag_drop_items(task, lesson_text_parts)
                    task_data["correct_order"] = list(range(len(task_data["items"])))
                elif question_type == "multiple_choice":
                    # Generate options for multiple choice
                    options, correct_idx = generate_multiple_choice_options(task, ' '.join(lesson_text_parts))
                    task_data["options"] = options
                    task_data["correct"] = correct_idx
                elif question_type == "fill_in_blank":
                    # Create fill-in-the-blank from lesson text
                    key_words = extract_key_words_for_fill_blank(' '.join(lesson_text_parts))
                    if key_words:
                        key_word = key_words[0]  # Use first key word
                        blank_text = create_fill_in_blank_from_text(' '.join(lesson_text_parts), key_word)
                        if blank_text:
                            task_data["question"] = blank_text
                            task_data["correctAnswer"] = key_word
                        else:
                            # Fallback to original question as text_answer
                            task_data["questionFormat"] = "text_answer"
                    else:
                        task_data["questionFormat"] = "text_answer"
                
                tasks.append(task_data)
        
        # Extract Key Points and add to lesson text
        key_points_text = extract_section_text(lesson_block, r'Key Points:', [r'Questions:', r'More to Learn:', r'Skill Check:'])
        if key_points_text:
            bullets = extract_bullets(key_points_text)
            for bp in bullets:
                if len(bp) > 10:
                    lesson_text_parts.append(f"\n\n• {bp}")
            
            # Also extract structured key points
            key_points_clean = clean_rtf(key_points_text)
            if key_points_clean and len(key_points_clean) > 20:
                lesson_text_parts.append(f"\n\nKey Points:\n{key_points_clean}")
        
        # Extract Questions (followUps) - first Questions section (after Key Points, before More to Learn)
        follow_ups = []
        # Find Questions section that comes after Key Points
        questions_match = re.search(r'Questions:', lesson_block, re.IGNORECASE)
        if questions_match:
            # Get text from Questions to next major section (More to Learn or Skill Check)
            q_start = questions_match.end()
            # Find next major section marker
            next_section = re.search(r'(More to Learn:|Skill Check:|\\fs51)', lesson_block[q_start:], re.IGNORECASE)
            if next_section:
                questions_text = lesson_block[q_start:q_start + next_section.start()]  # Keep raw for extract_bullets
            else:
                questions_text = lesson_block[q_start:]  # Keep raw for extract_bullets
            
            followup_list = extract_bullets(questions_text)
            for i, followup in enumerate(followup_list):
                # Clean up the followup text
                followup = followup.strip()
                
                # Skip if empty or just whitespace
                if not followup or len(followup) < 5:
                    continue
                
                # Only skip obvious non-questions (section headers)
                if followup.lower().startswith(('key points:', 'more to learn:', 'skill check:', 'questions:')):
                    continue
                
                # Skip if it's extremely long (likely content, not a question) - but be lenient
                if len(followup) > 500:
                    continue
                
                # Assign question type with variety: mix of types
                if i % 3 == 0:
                    question_type = "text_answer"
                elif i % 3 == 1:
                    question_type = "multiple_choice"
                else:
                    question_type = "fill_in_blank"
                
                # Override with intelligent detection if it's clearly a specific type
                detected_type = determine_question_type(followup)
                if detected_type in ["drag_drop", "fill_in_blank"]:
                    question_type = detected_type
                
                followup_data = {
                    "id": i + 1,
                    "question": followup,
                    "questionFormat": question_type,
                    "adaptive": True,
                    "feedback": "Great thinking! Review the key points if you need help."
                }
                
                if question_type == "drag_drop":
                    followup_data["items"] = extract_drag_drop_items(followup, lesson_text_parts)
                    followup_data["correct_order"] = list(range(len(followup_data["items"])))
                elif question_type == "multiple_choice":
                    # Generate options for multiple choice
                    options, correct_idx = generate_multiple_choice_options(followup, ' '.join(lesson_text_parts))
                    followup_data["options"] = options
                    followup_data["correct"] = correct_idx
                elif question_type == "fill_in_blank":
                    # Create fill-in-the-blank from lesson text
                    key_words = extract_key_words_for_fill_blank(' '.join(lesson_text_parts))
                    if key_words:
                        key_word = key_words[i % len(key_words)] if key_words else None
                        if key_word:
                            blank_text = create_fill_in_blank_from_text(' '.join(lesson_text_parts), key_word)
                            if blank_text:
                                followup_data["question"] = blank_text
                                followup_data["correctAnswer"] = key_word
                            else:
                                followup_data["questionFormat"] = "text_answer"
                        else:
                            followup_data["questionFormat"] = "text_answer"
                    else:
                        followup_data["questionFormat"] = "text_answer"
                
                follow_ups.append(followup_data)
        
        # Extract More to Learn
        more_text = extract_section_text(lesson_block, r'More to Learn:', [r'Skill Check:', r'Questions:'])
        if more_text:
            more_clean = clean_rtf(more_text)
            if more_clean and len(more_clean) > 20:
                lesson_text_parts.append(f"\n\nMore to Learn:\n{more_clean}")
        
        # Extract Quiz Questions - use Skill Check section if available, otherwise last Questions section
        quiz_questions = []
        quiz_text = None
        
        # First try to find Skill Check section
        skill_check_match = re.search(r'Skill Check:', lesson_block, re.IGNORECASE)
        if skill_check_match:
            sc_start = skill_check_match.end()
            # Find next section marker or end of lesson
            next_section = re.search(r'\\fs51\\fsmilli25995\s+\\cf2\s+\d+\s+\|', lesson_block[sc_start:])
            if next_section:
                quiz_text = lesson_block[sc_start:sc_start + next_section.start()]  # Keep raw for extract_bullets
            else:
                quiz_text = lesson_block[sc_start:]  # Keep raw for extract_bullets
        else:
            # Fall back to last Questions section if Skill Check not found
            all_questions_sections = list(re.finditer(r'Questions:', lesson_block, re.IGNORECASE))
            if len(all_questions_sections) > 1:
                # Use the last Questions section for quiz
                last_q_start = all_questions_sections[-1].end()
                last_q_end = len(lesson_block)
                # Find next section marker
                next_section = re.search(r'\\fs51\\fsmilli25995\s+\\cf2\s+\d+\s+\|', lesson_block[last_q_start:])
                if next_section:
                    last_q_end = last_q_start + next_section.start()
                quiz_text = lesson_block[last_q_start:last_q_end]  # Keep raw for extract_bullets
        
        if quiz_text:
            quiz_list = extract_bullets(quiz_text)
            # Combine all lesson content for context
            full_lesson_content = ' '.join(lesson_text_parts)
            
            for i, quiz_item in enumerate(quiz_list):
                # Clean up the quiz item text
                quiz_item = quiz_item.strip()
                
                # Skip if empty or just whitespace
                if not quiz_item or len(quiz_item) < 5:
                    continue
                
                # Only skip obvious non-questions (section headers)
                if quiz_item.lower().startswith(('key points:', 'more to learn:', 'skill check:', 'questions:')):
                    continue
                
                # Skip if it's extremely long (likely content, not a question) - but be lenient
                if len(quiz_item) > 500:
                    continue
                
                # Assign question type with variety: mix of types
                if i % 3 == 0:
                    question_type = "text_answer"
                elif i % 3 == 1:
                    question_type = "multiple_choice"
                else:
                    question_type = "fill_in_blank"
                
                # Override with intelligent detection if it's clearly a specific type
                detected_type = determine_question_type(quiz_item)
                if detected_type in ["drag_drop", "fill_in_blank"]:
                    question_type = detected_type
                
                # Generate explanation based on question and content
                if question_type == "multiple_choice":
                    options, correct_idx = generate_multiple_choice_options(quiz_item, full_lesson_content)
                    correct_answer = options[correct_idx] if options else None
                    explanation = generate_explanation(quiz_item, full_lesson_content, correct_answer)
                else:
                    explanation = generate_explanation(quiz_item, full_lesson_content)
                
                question_data = {
                    "id": i + 1,
                    "question": quiz_item,
                    "type": question_type,
                    "explanation": explanation
                }
                
                if question_type == "multiple_choice":
                    question_data["options"] = options
                    question_data["correct"] = correct_idx
                elif question_type == "drag_drop":
                    question_data["items"] = extract_drag_drop_items(quiz_item, lesson_text_parts)
                    question_data["correct_order"] = list(range(len(question_data["items"])))
                elif question_type == "fill_in_blank":
                    # Create fill-in-the-blank from lesson text
                    key_words = extract_key_words_for_fill_blank(full_lesson_content)
                    if key_words:
                        key_word = key_words[i % len(key_words)] if key_words else None
                        if key_word:
                            blank_text = create_fill_in_blank_from_text(full_lesson_content, key_word)
                            if blank_text:
                                question_data["question"] = blank_text
                                question_data["correctAnswer"] = key_word
                            else:
                                question_data["type"] = "text_answer"
                        else:
                            question_data["type"] = "text_answer"
                    else:
                        question_data["type"] = "text_answer"
                
                quiz_questions.append(question_data)
        
        # Combine text
        main_text = "\n\n".join(lesson_text_parts) if lesson_text_parts else f"Content for {title}"
        
        # Ensure minimum content
        if not tasks:
            tasks = [{"id": 1, "type": "interactive", "question": "What did you learn from this lesson?", "questionFormat": "text_answer", "hint": "Think about the key points."}]
        if not follow_ups:
            follow_ups = [{"id": 1, "question": "Can you explain the main concept?", "questionFormat": "text_answer", "adaptive": True, "feedback": "Great thinking!"}]
        if not quiz_questions:
            # Generate a quiz question from the lesson content
            fallback_question = f"What is the main takeaway from this lesson about {title}?"
            options, correct_idx = generate_multiple_choice_options(fallback_question, main_text)
            explanation = generate_explanation(fallback_question, main_text, options[correct_idx] if options else None)
            quiz_questions = [{
                "id": 1, 
                "question": fallback_question,
                "type": "multiple_choice",
                "options": options,
                "correct": correct_idx,
                "explanation": explanation
            }]
        
        lessons.append({
            "path_type": path_type,
            "order_index": lesson_num,
            "title": title,
            "objective": objective,
            "main_text": main_text,
            "tasks": tasks,
            "follow_ups": follow_ups,
            "quiz_questions": quiz_questions
        })
        
        print(f"  ✓ Extracted: {len(tasks)} tasks, {len(follow_ups)} follow-ups, {len(quiz_questions)} quiz questions")
        print(f"  ✓ Text length: {len(main_text)} characters")
    
    return lessons

def generate_sql(lessons):
    """Generate SQL INSERT statements"""
    sql_lines = [
        "-- ============================================",
        "-- COMPLETE SQL - ALL 46 LESSONS",
        "-- 28 Pre-Med Lessons + 18 Med Lessons",
        "-- Generated from RTF files with COMPLETE content",
        "-- Includes actual questions, descriptions, and quiz questions",
        "-- ============================================\n",
        "-- IMPORTANT: Before running this, first:\n",
        "-- 1. Run CLEAN_DUPLICATES_SIMPLE.sql to remove duplicates\n",
        "-- 2. Or delete all existing lessons: DELETE FROM lessons;\n",
        "-- 3. Then run this file to insert all 46 lessons\n\n"
    ]
    
    for lesson in lessons:
        # Determine competence tag
        title_lower = lesson["title"].lower()
        if "first aid" in title_lower or "emergency" in title_lower:
            competence = "first aid"
        elif "safe" in title_lower or "health" in title_lower or "prevent" in title_lower or "hygiene" in title_lower:
            competence = "safe"
        else:
            competence = "anatomy"
        
        content = {
            "text": lesson["main_text"],
            "tasks": lesson["tasks"],
            "followUps": lesson["follow_ups"],
            "quiz": {"questions": lesson["quiz_questions"]}
        }
        
        content_json = json.dumps(content, ensure_ascii=False).replace("'", "''")
        title_esc = lesson["title"].replace("'", "''")
        obj_esc = lesson["objective"].replace("'", "''")
        
        sql = f"""INSERT INTO lessons (path_type, order_index, title, objective, estimated_duration, competence_tag, content) VALUES
('{lesson["path_type"]}', {lesson["order_index"]}, '{title_esc}', 
'{obj_esc}',
20,
'{competence}',
'{content_json}'::jsonb);"""
        
        sql_lines.append(sql)
        sql_lines.append("")
    
    return '\n'.join(sql_lines)

# Main execution
if __name__ == "__main__":
    print("=" * 60)
    print("COMPREHENSIVE RTF PARSER")
    print("Extracting complete lesson content with proper quiz questions")
    print("=" * 60)

    print("\nParsing Pre-Med lessons...")
    premed_lessons = parse_rtf_file('pre-med.rtf', 'Pre-Med', 28)

    print("\nParsing Med lessons...")
    med_lessons = parse_rtf_file('med.rtf', 'Med', 18)

    all_lessons = premed_lessons + med_lessons

    print(f"\n{'=' * 60}")
    print(f"Total lessons extracted: {len(all_lessons)}")
    print(f"{'=' * 60}")

    sql_output = generate_sql(all_lessons)

    with open('COMPLETE_ALL_46_LESSONS.sql', 'w', encoding='utf-8') as f:
        f.write(sql_output)

    print("\n✓ SQL file generated: COMPLETE_ALL_46_LESSONS.sql")
    insert_count = len([l for l in sql_output.split('\n') if l.strip().startswith('INSERT')])
    print(f"✓ Total INSERT statements: {insert_count}")

