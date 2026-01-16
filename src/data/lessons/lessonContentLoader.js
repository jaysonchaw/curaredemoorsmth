// Lesson content loader - stores educational content for each lesson
// This content is displayed in the book modal when students click the book icon

export const getLessonContent = (lessonId) => {
  const contentMap = {
    1: {
      sections: [
        {
          type: 'paragraph',
          content: 'The human body is made of many parts (bones, muscles, heart, lungs, brain, stomach, etc.), each in a system with a special role. These systems must work together. Each system (like skeletal, muscular, circulatory, respiratory, nervous) has a main job, and health depends on them cooperating.'
        },
        {
          type: 'image',
          src: '/lesson1image1.webp',
          alt: 'Lesson 1',
          caption: 'Figure 1.1: Anatomical rendering of the human torso, the lungs and heart shown in warm relief'
        },
        {
          type: 'bullets',
          items: [
            'Major body systems include skeletal (bones), muscular (muscles), circulatory (heart/vessels), respiratory (lungs), nervous (brain/nerves), digestive, and others.',
            'Bones (skeletal) and muscles (muscular) work together: bones provide shape/support and protect organs, while muscles pull on bones to move. For example, the ribcage (bones) shields the heart and lungs.',
            'The heart and blood vessels (circulatory system) work with the lungs (respiratory system) to pump oxygenated blood to every cell. The brain and nerves (nervous system) send messages between the brain and body parts.'
          ]
        },
        {
          type: 'image',
          src: '/lesson1image2.avif',
          alt: 'Lesson 1',
          caption: 'Figure 1.2 | Illustration of the human body, presenting the major internal organs in careful proportion'
        }
      ],
      sources: [
        {
          name: 'Learning Resources',
          url: 'https://learningresources.com/media/pdf/lr/resources/10-Easy-Steps-to-Teaching-The-Human-Body.pdf',
          favicon: 'https://www.google.com/s2/favicons?domain=learningresources.com&sz=32'
        },
        {
          name: 'Britannica',
          url: 'https://www.britannica.com/science/human-body',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'Medical News Today',
          url: 'https://www.medicalnewstoday.com/articles/organs-in-the-body',
          favicon: 'https://www.google.com/s2/favicons?domain=medicalnewstoday.com&sz=32'
        }
      ]
    },
    2: {
      sections: [
        {
          type: 'paragraph',
          content: 'Cells are the tiny units of life in our bodies; they are the basic building blocks of the body. Every tissue and organ is made of many cells. Cells are so small we need a microscope to see them, but our body has trillions. Each cell has a job (e.g. muscle cells help us move, nerve cells send signals). Cells can divide to make new cells, which helps us grow and heal.'
        },
        {
          type: 'image',
          src: '/lesson2image1.jpeg',
          alt: 'Lesson 2',
          caption: 'Figure 2.1 | Red blood cells suspended in motion, their flattened, disc-like form optimized to carry oxygen efficiently through the body\'s narrowest vessels.'
        },
        {
          type: 'bullets',
          items: [
            'Cells are tiny but numerous: the body contains trillions of cells. Each type of cell has a function (muscle cells contract for movement, nerve cells send messages). Groups of similar cells form tissues.',
            'When we eat and play, cells need to divide to grow new tissue and replace old or injured cells. Cell division copies the cell\'s genes so the new cell is like the original.',
            'Cells organize life: many similar cells make a tissue, and different tissues combine to make an organ. For example, heart muscle cells form cardiac tissue, and cardiac tissue (with other tissue types) makes the heart organ.'
          ]
        },
        {
          type: 'image',
          src: '/lesson2image2.jpg',
          alt: 'Lesson 2',
          caption: 'Figure 2.2 | A fluorescence micrograph of intestinal tissue placed under a microscope, revealing tightly folded layers of cells and microbes.'
        },
        {
          type: 'paragraph',
          content: 'Cells keep tissues healthy. Healthy muscle tissue comes from healthy muscle cells working together. If cells multiply healthily, organs grow and work well.'
        },
        {
          type: 'paragraph',
          content: 'Remember it goes cells → tissues → organs → systems. This pattern repeats at each level of our body\'s organization.'
        }
      ],
      sources: [
        {
          name: 'CureSearch',
          url: 'https://curesearch.org/What-is-Cancer#:~:text=Cells%20are%20the%20basic%20building,to%20perform%20either%20by%20itself',
          favicon: 'https://www.google.com/s2/favicons?domain=curesearch.org&sz=32'
        },
        {
          name: 'Ambar Lab',
          url: 'https://ambar-lab.com/en/what-are-erythrocytes-and-what-can-they-indicate-to-us/',
          favicon: 'https://www.google.com/s2/favicons?domain=ambar-lab.com&sz=32'
        },
        {
          name: 'Science Focus',
          url: 'https://www.sciencefocus.com/news/human-cell-atlas',
          favicon: 'https://www.google.com/s2/favicons?domain=sciencefocus.com&sz=32'
        }
      ]
    },
    3: {
      sections: [
        {
          type: 'paragraph',
          content: 'Tissues are groups of similar cells working together, and organs are made of two or more tissue types. For example, muscle tissue is made of muscle cells, and your stomach is an organ made of muscle tissue plus other tissues. Groups of cells make tissues, and groups of tissues form organs. This shows that cells build tissues, tissues make organs, and organs make systems.'
        },
        {
          type: 'image',
          src: '/lesson3image1.jpeg',
          alt: 'Lesson 3',
          caption: 'Skeletal muscle tissue, showing how many similar cells are grouped together to form a tissue that contributes to larger organs.'
        },
        {
          type: 'bullets',
          items: [
            'A tissue is a group of similar cells doing a job. For example, muscle tissue is many muscle cells working together. Skin tissue is many skin cells joined in layers.',
            'An organ is made of different tissues. For example, the heart is an organ with muscle tissue (to pump), nerve tissue (to regulate heartbeat), and blood vessel tissue (to carry blood). The stomach organ has muscle tissue (to churn food) and lining tissue (to protect and digest).',
            'Think of a house: cells are like bricks, tissues are like walls, and organs are like rooms. Each level builds on the smaller ones.'
          ]
        },
        {
          type: 'image',
          src: '/lesson3image2.jpg',
          alt: 'Lesson 3',
          caption: 'Figure 1.1 | A house used as an analogy: many small parts form larger structures, just as cells form tissues and tissues form organs.'
        },
        {
          type: 'paragraph',
          content: 'Examples: Skin is an organ made mostly of skin cells (epidermis tissue) and inner skin layers. The stomach is an organ made of muscle tissue (to move food), inner lining tissue (for digestive juices), and connective tissues.'
        },
        {
          type: 'paragraph',
          content: 'Recognizing that cells → tissue → organ helps us understand the body\'s structure.'
        }
      ],
      sources: [
        {
          name: 'CureSearch',
          url: 'https://curesearch.org/What-is-Cancer#:~:text=Cells%20are%20the%20basic%20building,for%20what%20role%20the%20cell',
          favicon: 'https://www.google.com/s2/favicons?domain=curesearch.org&sz=32'
        },
        {
          name: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Striated_muscle_tissue',
          favicon: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32'
        },
        {
          name: 'House Digest',
          url: 'https://www.housedigest.com/789739/common-house-styles-to-inspire-your-next-home/',
          favicon: 'https://www.google.com/s2/favicons?domain=housedigest.com&sz=32'
        }
      ]
    },
    4: {
      sections: [
        {
          type: 'paragraph',
          content: 'The skeletal system is the body\'s support framework made of bones and joints. The human skeleton has about 206 bones in adults. These hard bones give the body shape and protect soft organs (for example, the ribcage shields the heart and lungs). Joints (like knees and elbows) are places where two bones meet and allow movement (hinge joints like knees flex, ball-and-socket joints like hips rotate). Bones also store minerals like calcium and contain bone marrow, where blood cells are made.'
        },
        {
          type: 'image',
          src: '/lesson4image1.jpeg',
          alt: 'Lesson 4',
          caption: 'The human skeleton shown from multiple angles, highlighting the bones and joints that support the body, protect organs, and allow movement.'
        },
        {
          type: 'bullets',
          items: [
            'The skeleton provides a sturdy framework for the body. Bones support your weight and give you your shape. For example, the spine keeps you upright and the skull (head bone) protects the brain.',
            'Bones protect soft organs. Ribs protect the heart and lungs; the skull protects the brain; the pelvis protects parts of the digestive and reproductive systems.',
            'Bones meet at joints, which allow movement. For instance, elbow and knee are hinge joints that bend. Shoulder and hip are ball-socket joints that move in all directions.'
          ]
        },
        {
          type: 'image',
          src: '/lesson4image2.webp',
          alt: 'Lesson 4',
          caption: 'The elbow joint, where bones meet to form a hinge that allows the arm to bend and straighten.'
        },
        {
          type: 'paragraph',
          content: 'Bones have additional roles: they store minerals (like calcium and phosphorus) which strengthen bones, and bone marrow (inside some bones) makes new blood cells.'
        },
        {
          type: 'paragraph',
          content: 'Examples: Femur (thigh bone) is the longest bone, helping us walk; the ribs form the ribcage protecting chest organs.'
        }
      ],
      sources: [
        {
          name: 'Britannica Kids',
          url: 'https://kids.britannica.com/students/article/human-anatomy/272852#:~:text=The%20human%20skeletal%20system%20is,of%20various%20shapes%E2%80%94long%2C%20short%2C%20cube',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'Live Science',
          url: 'https://www.livescience.com/health/anatomy/human-skeleton-quiz-what-do-you-know-about-the-bones-in-your-body',
          favicon: 'https://www.google.com/s2/favicons?domain=livescience.com&sz=32'
        },
        {
          name: 'Britannica',
          url: 'https://www.britannica.com/science/elbow-anatomy',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        }
      ]
    },
    5: {
      sections: [
        {
          type: 'paragraph',
          content: 'The muscular system consists of tissues (muscles) that can contract (tighten) to move bones and parts of the body. When muscles contract, they pull on bones at joints to create motion. For example, the muscles in your legs and arms let you run, jump, and lift things. Muscles do more than move limbs: the heart itself is a muscle (cardiac muscle) that pumps blood, and smooth muscles in organs (like the stomach and intestines) help move food along.'
        },
        {
          type: 'image',
          src: '/lesson5image1.jpg',
          alt: 'Lesson 5',
          caption: 'A flexed arm muscle, showing how muscles contract to pull on bones and create movement.'
        },
        {
          type: 'bullets',
          items: [
            'Skeletal muscles attach to bones and pull on them to create voluntary movement. When you decide to move, your brain tells a muscle to contract, which causes your arm to lift or your leg to step forward.',
            'Muscle activity produces heat. When muscles work hard (exercise), your body warms up. Muscles also help maintain posture and protect internal organs.',
            'There are three types of muscle: skeletal (attached to bones, under conscious control), cardiac (the heart, works automatically), and smooth (in organs like stomach, intestines, blood vessels, work automatically). For example, the heart\'s muscle (cardiac) pumps blood; smooth muscles in your stomach mix food.'
          ]
        },
        {
          type: 'image',
          src: '/lesson5image2.jpeg',
          alt: 'Lesson 5',
          caption: 'The skeletal muscles of the upper body, showing muscles that attach to bones and contract to produce voluntary movement.'
        },
        {
          type: 'paragraph',
          content: 'Muscles work in groups: to bend an arm, the biceps muscle contracts while the triceps relaxes. When you run, muscles in your legs contract in sequence to make stepping possible.'
        },
        {
          type: 'paragraph',
          content: 'Exercise helps muscles grow stronger and more efficient. Keeping muscles healthy (through activity and proper nutrition) helps all movement.'
        }
      ],
      sources: [
        {
          name: 'Britannica Kids',
          url: 'https://kids.britannica.com/students/article/human-anatomy/272852#:~:text=primary%20task%20of%20the%20muscular,of%20intestines%2C%20lungs%2C%20urinary%20bladder',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'Cathe',
          url: 'https://cathe.com/what-genetic-factors-determine-the-shape-of-your-muscles-and-how-strong-they-are/',
          favicon: 'https://www.google.com/s2/favicons?domain=cathe.com&sz=32'
        },
        {
          name: 'Penang Adventist Hospital',
          url: 'https://pah.com.my/articles/are-muscles-important/',
          favicon: 'https://www.google.com/s2/favicons?domain=pah.com.my&sz=32'
        }
      ]
    },
    6: {
      sections: [
        {
          type: 'paragraph',
          content: 'The nervous system is made of the brain, spinal cord, and nerves throughout the body. The brain is the control center: it receives information from your senses (eyes, ears, etc.) and sends out instructions. Nerves carry information between the brain and body. For example, nerves send sensory signals (like touch or sound) to the brain, and the brain sends motor signals back to muscles. In short, the nervous system lets you sense the world and move or react.'
        },
        {
          type: 'image',
          src: '/lesson6image1.jpg',
          alt: 'Lesson 6',
          caption: 'The brain, the main control center of the nervous system, receiving information and sending signals to the rest of the body.'
        },
        {
          type: 'bullets',
          items: [
            'Central parts: the brain and spinal cord; peripheral parts: all the nerves branching out. Nerves act like wires transmitting signals. For example, if you step on a sharp object, sensory nerves send a "pain" message to your brain.',
            'Sensory nerves carry information (what you see, hear, feel) to the brain, and motor nerves carry instructions from the brain to muscles. The brain processes input and decides actions (like moving a hand).',
            'This system is how you can see, hear, speak, think, and react to things instantly. Without it, the body wouldn\'t know what\'s happening or how to respond.'
          ]
        },
        {
          type: 'image',
          src: '/lesson6image2.jpg',
          alt: 'Lesson 6',
          caption: 'A network of nerves branching through the nervous system, carrying signals between the brain and the rest of the body.'
        },
        {
          type: 'paragraph',
          content: 'Neurons are nerve cells. They connect all parts of the body to the brain, making a network. Nerve signals are very fast (like an electrical current).'
        },
        {
          type: 'paragraph',
          content: 'Healthy nervous system: protect your brain (wear helmets), and keep nerves healthy (avoid injuries). The brain controls your movements and thoughts, so keeping it well-rested and oxygenated is important.'
        }
      ],
      sources: [
        {
          name: 'Britannica Kids',
          url: 'https://kids.britannica.com/students/article/human-anatomy/272852#:~:text=Like%20the%20endocrine%20system%2C%20the,or%20effort%20by%20the%20individual',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'NeuroSpine Surgical Consultants',
          url: 'https://neurospinesurgical.com/2018/01/04/5-facts-didnt-know-human-brain/',
          favicon: 'https://www.google.com/s2/favicons?domain=neurospinesurgical.com&sz=32'
        },
        {
          name: 'Genetic Engineering & Biotechnology News',
          url: 'https://www.genengnews.com/topics/translational-medicine/traumatic-brain-injury-forge-new-neural-pathways/',
          favicon: 'https://www.google.com/s2/favicons?domain=genengnews.com&sz=32'
        }
      ]
    },
    7: {
      sections: [
        {
          type: 'paragraph',
          content: 'The circulatory system (cardiovascular system) includes the heart and a network of blood vessels (arteries and veins). The heart is a muscle pump that pushes blood through the body. Blood carries oxygen and nutrients to every cell and removes wastes like carbon dioxide. In each beat, the heart sends oxygen-rich blood (from the lungs) out to the body, and brings oxygen-poor blood back to the lungs for more oxygen. The blood also carries immune cells that fight germs.'
        },
        {
          type: 'image',
          src: '/lesson7image1.webp',
          alt: 'Lesson 7',
          caption: 'The circulatory system, showing the heart and blood vessels that move blood around the body.'
        },
        {
          type: 'bullets',
          items: [
            'The heart (a muscle) beats to circulate blood. Arteries carry blood away from the heart (usually oxygen-rich), veins carry blood to the heart (often oxygen-poor). Capillaries are tiny vessels where exchanges happen.',
            'Blood delivers oxygen and nutrients (from the digestive system) to cells and picks up carbon dioxide and wastes to carry away. This is essential: without blood flow, cells would starve and waste would build up.',
            'The circulatory system works closely with the respiratory system: lungs oxygenate blood, then the heart pumps it to body cells. It also helps the immune system by transporting white blood cells to fight infections.'
          ]
        },
        {
          type: 'image',
          src: '/lesson7image2.jpg',
          alt: 'Lesson 7',
          caption: 'The heart, a muscular pump that circulates blood through the body.'
        },
        {
          type: 'paragraph',
          content: 'Good heart health: exercise (aerobic) strengthens the heart. For example, jogging or cycling improves cardiac endurance.'
        },
        {
          type: 'paragraph',
          content: 'Blood pressure: the pressure of blood on vessel walls; too high pressure can damage vessels, so diet and exercise help keep it normal.'
        }
      ],
      sources: [
        {
          name: 'Britannica Kids',
          url: 'https://kids.britannica.com/students/article/human-anatomy/272852#:~:text=All%20parts%20of%20the%20body,system%20and%20the%20lymphatic%20system',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'eMedicineHealth',
          url: 'https://www.emedicinehealth.com/what_does_the_circulatory_system_do/article_em.htm',
          favicon: 'https://www.google.com/s2/favicons?domain=emedicinehealth.com&sz=32'
        },
        {
          name: 'SciTechDaily',
          url: 'https://scitechdaily.com/scientists-discover-self-healing-secrets-of-the-human-heart/',
          favicon: 'https://www.google.com/s2/favicons?domain=scitechdaily.com&sz=32'
        }
      ]
    },
    8: {
      sections: [
        {
          type: 'paragraph',
          content: 'The respiratory system brings air in and out of the body to exchange gases. Air enters through your nose or mouth, goes down the windpipe (trachea) into the lungs. In the lungs, tiny sacs called alveoli exchange oxygen and carbon dioxide with the blood. Oxygen from the air moves into the blood, and carbon dioxide (a waste gas) moves from blood into the alveoli to be exhaled. Breathing happens when the diaphragm (a muscle under the lungs) contracts and relaxes, making the lungs expand and release air.'
        },
        {
          type: 'image',
          src: '/lesson8image1.webp',
          alt: 'Lesson 8',
          caption: 'The lungs and airways, where oxygen enters the body and carbon dioxide is removed during breathing.'
        },
        {
          type: 'bullets',
          items: [
            'Lungs are the key organs of the respiratory system. They take in oxygen from the air and remove carbon dioxide. Inhaling (breathing in) fills lungs with air; exhaling pushes air (with CO₂) out.',
            'Oxygen in the lungs passes into the bloodstream (via capillaries around alveoli), and carbon dioxide in blood passes into the lungs to exit the body.',
            'The diaphragm muscle controls breathing: when it moves down, lungs expand (inhaling); when it moves up, lungs contract (exhaling). We breathe automatically, and cells need that oxygen to make energy.'
          ]
        },
        {
          type: 'image',
          src: '/lesson8image2.jpg',
          alt: 'Lesson 8',
          caption: 'Red blood cells moving through a blood vessel, carrying oxygen from the lungs to body cells.'
        },
        {
          type: 'paragraph',
          content: 'Healthy breathing: keep lungs clear by avoiding smoke and pollutants. Exercise also keeps lung capacity strong.'
        },
        {
          type: 'paragraph',
          content: 'Quick fact: we breathe about 12–20 times per minute at rest. This ensures a constant supply of oxygen.'
        }
      ],
      sources: [
        {
          name: 'Britannica Kids',
          url: 'https://kids.britannica.com/students/article/human-anatomy/272852#:~:text=The%20respiratory%20system%20helps%20in,small%20air%20spaces%20called%20alveoli',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'South China Morning Post',
          url: 'https://www.scmp.com/lifestyle/health-wellness/article/3051745/lungs-how-they-work-what-coronavirus-does-them-and',
          favicon: 'https://www.google.com/s2/favicons?domain=scmp.com&sz=32'
        },
        {
          name: 'LOOKEETech',
          url: 'https://www.lookeetech.com/blogs/news/understanding-normal-blood-oxygen-levels?srsltid=AfmBOoouoIeOSXw4Z6aH1aZE5Hwy5uh8MZZdTxR9ztydK1TYusfaoxLD',
          favicon: 'https://www.google.com/s2/favicons?domain=lookeetech.com&sz=32'
        }
      ]
    },
    9: {
      sections: [
        {
          type: 'paragraph',
          content: 'The digestive system breaks down food and absorbs nutrients so the body can use them. We start by eating food in the mouth (chewing with teeth). Food travels down the esophagus to the stomach, where it is churned with stomach acid. It then moves to the small intestine, where most digestion and nutrient absorption happens. The large intestine absorbs water and some vitamins, and prepares waste. Along the way, accessory organs help: the liver produces bile (to break down fats), and the pancreas adds enzymes. In the end, nutrients (sugars, proteins, fats, vitamins, minerals) pass into the blood through the intestinal walls. This gives us energy and materials to grow.'
        },
        {
          type: 'image',
          src: '/lesson9image1.jpg',
          alt: 'Lesson 9',
          caption: 'The digestive system, where food is broken down and nutrients are absorbed into the body.'
        },
        {
          type: 'bullets',
          items: [
            'Food pathway: mouth (chew) → esophagus (tube to stomach) → stomach (mixes with acid to break food) → small intestine (breaks food into nutrients, which enter blood) → large intestine (absorbs water, forms solid waste).',
            'Nutrients: carbohydrates and fats provide energy, proteins repair and build body parts (muscles, organs). Vitamins and minerals (in fruits/veggies, milk, meat) keep the body\'s systems working well (e.g. calcium for bones, vitamin C for healing).',
            'A balanced diet is important: fruits and vegetables supply vitamins, whole grains give sustained energy, and protein (meat, beans) builds muscles and cells. Unhealthy foods (too much sugar/fat) can cause problems like cavities or obesity.'
          ]
        },
        {
          type: 'image',
          src: '/lesson9image2.avif',
          alt: 'Lesson 9',
          caption: 'A balanced meal showing different food groups that provide energy, nutrients, and materials for growth and repair.'
        },
        {
          type: 'paragraph',
          content: 'Good digestion: chew well, eat slowly, and drink water. Fiber (from fruits/vegetables) helps move food along and keeps bowel movements regular.'
        },
        {
          type: 'paragraph',
          content: 'What\'s left undigested becomes waste (feces) and is removed from the body. Keeping a healthy diet (lots of natural foods, enough water) keeps digestion working smoothly.'
        }
      ],
      sources: [
        {
          name: 'Britannica Kids',
          url: 'https://kids.britannica.com/kids/article/digestive-system/353054#:~:text=endocrine%20system%20and%20the%20digestive,make%20up%20the%20digestive%20system',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'AIU',
          url: 'https://www.aiu.edu/blog/the-digestive-system-a-comprehensive-overview/',
          favicon: 'https://www.google.com/s2/favicons?domain=aiu.edu&sz=32'
        },
        {
          name: 'Alimentarium',
          url: 'https://www.alimentarium.org/en/story/what-exactly-balanced-meal',
          favicon: 'https://www.google.com/s2/favicons?domain=alimentarium.org&sz=32'
        }
      ]
    },
    10: {
      sections: [
        {
          type: 'paragraph',
          content: 'Our five senses (sight, hearing, smell, taste, touch) help us experience the world. Each sense has special organs: eyes see (light, colors, shapes), ears hear (sounds), nose smells, tongue tastes, and skin feels touch (pressure), temperature, and pain. These senses send information to the brain so we can learn and react. For example, we see a rainbow (eyes) and our brain recognizes colors; we hear music (ears) and enjoy it. The five senses — seeing, hearing, smelling, tasting, and touching — help us to learn about our surroundings.'
        },
        {
          type: 'image',
          src: '/lesson10image1.webp',
          alt: 'Lesson 10',
          caption: 'The sense of touch, as the skin feels objects in the surrounding environment.'
        },
        {
          type: 'bullets',
          items: [
            'Eyes (vision): detect light and color, letting us see shapes and movement.',
            'Ears (hearing): pick up sound waves, allowing us to hear speech, music, and noises.',
            'Nose (smell): senses scents in the air (like flowers or smoke), alerting us to things (good and dangerous).',
            'Tongue (taste): has taste buds for sweet, sour, salty, bitter, umami, telling us flavors (like tasting an apple or chili).',
            'Skin (touch): distributed all over the body, senses pressure, heat/cold, pain. For example, feeling the warmth of the sun or a gentle touch on your arm.',
            'All these senses send signals through nerves to the brain to interpret (connects with the nervous system). They keep us safe (smelling smoke) and help learning (seeing a book, hearing a teacher).'
          ]
        },
        {
          type: 'image',
          src: '/lesson10image2.webp',
          alt: 'Lesson 10',
          caption: 'A family sharing a meal, using their senses of sight, smell, taste, hearing, and touch to experience their surroundings.'
        },
        {
          type: 'paragraph',
          content: 'Sensory organs are part of body systems: eyes and ears are connected to the nervous system. The brain interprets signals like "the light is red" or "that smells like cookies."'
        },
        {
          type: 'paragraph',
          content: 'Protect your senses: don\'t look at the sun or bright lights, keep ears away from loud sounds, taste food carefully (no licking unknown objects), wash hands to avoid bad smells/germs.'
        }
      ],
      sources: [
        {
          name: 'KidsHealth',
          url: 'https://kidshealth.org/classroom/prekto2/body/functions/senses.pdf#:~:text=are%20they%3F%20Your%20senses%21%20The,seeing%2C%20hearing%2C%20smelling%2C%20tasting%2C%20and',
          favicon: 'https://www.google.com/s2/favicons?domain=kidshealth.org&sz=32'
        },
        {
          name: 'Stocksy',
          url: 'https://www.stocksy.com/photo/761644/a-young-womans-hand-touching-tiny-flowers-in-a-green-field-during-a-summer-afternoon?zs=1',
          favicon: 'https://www.google.com/s2/favicons?domain=stocksy.com&sz=32'
        },
        {
          name: 'UCSF Benioff Children\'s Hospitals',
          url: 'https://www.ucsfbenioffchildrens.org/education/mealtime-atmosphere-and-eating-behavior',
          favicon: 'https://www.google.com/s2/favicons?domain=ucsfbenioffchildrens.org&sz=32'
        }
      ]
    },
    11: {
      sections: [
        {
          type: 'paragraph',
          content: 'Skin is the body\'s largest organ covering the entire outside surface. It protects the body from germs, injury, and extreme temperature changes. Skin has an outer layer (epidermis) and inner layer (dermis). It contains sweat glands, hair, and oil glands that keep it healthy. Skin also has many nerve endings so we can feel touch, pressure, pain, and temperature. For example, touching something hot triggers pain sensors in skin so you pull back. Good hygiene (cleanliness) keeps the skin barrier strong and prevents infections.'
        },
        {
          type: 'image',
          src: '/lesson11image1.webp',
          alt: 'Lesson 11',
          caption: 'Human skin, the body\'s outer covering that protects against harm and allows the sense of touch.'
        },
        {
          type: 'bullets',
          items: [
            'Skin acts like a barrier: it keeps germs and harmful substances out and keeps water and nutrients in. The outer layer stops many bacteria and cuts from reaching inside the body.',
            'Skin helps regulate temperature: when hot, we sweat (cooling effect); when cold, blood vessels tighten to keep us warm.',
            'We feel with skin: nerves in the skin send messages to the brain about touch, heat, cold, or pain. This sense of touch helps us respond (e.g., pulling away from a pinch or stepping around a sharp rock).'
          ]
        },
        {
          type: 'image',
          src: '/lesson11image2.jpg',
          alt: 'Lesson 11',
          caption: 'A cross-section diagram of the skin, showing the epidermis, dermis, and underlying tissues that protect the body and allow sensation.'
        },
        {
          type: 'paragraph',
          content: 'Skin health: keep it clean, moisturized, and protected from the sun. Drinking water also helps skin stay healthy.'
        },
        {
          type: 'paragraph',
          content: 'Skin accessories: hair and nails are made from skin proteins; sweat keeps us cool; oil glands prevent skin from drying out.'
        }
      ],
      sources: [
        {
          name: 'Britannica Kids',
          url: 'https://kids.britannica.com/students/article/human-anatomy/272852#:~:text=The%20integumentary%20system%20comprises%20a,part%20of%20the%20integumentary%20system',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'Prequel Skin',
          url: 'https://prequelskin.com/blogs/skin-notes-skincare-blog/normal-skin-type?srsltid=AfmBOornZ3hov5gDMABJNoxxje0roen4OUFFajiwRJ2y6zhjMJuOLMLs',
          favicon: 'https://www.google.com/s2/favicons?domain=prequelskin.com&sz=32'
        },
        {
          name: 'Cleveland Clinic',
          url: 'https://my.clevelandclinic.org/health/body/10978-skin',
          favicon: 'https://www.google.com/s2/favicons?domain=clevelandclinic.org&sz=32'
        }
      ]
    },
    12: {
      sections: [
        {
          type: 'paragraph',
          content: 'Food is fuel for the body: it provides energy for everything we do (running, thinking, growing). Our body needs a variety of nutrients from food: carbohydrates and fats give energy, proteins build and repair tissues (like muscles and skin), vitamins and minerals support growth and health, and water is crucial too. A balanced diet includes fruits, vegetables, whole grains, proteins (meat, beans, eggs), and some dairy or alternatives. For example, carrots provide vitamins important for eyes, meat or beans give protein for muscle, and whole grains give long-lasting energy.'
        },
        {
          type: 'image',
          src: '/lesson12image1.jpg',
          alt: 'Lesson 12',
          caption: 'A variety of healthy foods that provide energy and nutrients needed for growth, repair, and daily activities.'
        },
        {
          type: 'bullets',
          items: [
            'Proteins (meat, fish, eggs, beans) build and repair body parts (muscles, organs).',
            'Carbohydrates (bread, rice, fruits, vegetables) provide quick energy to move and think.',
            'Fats (nuts, oils, dairy) provide stored energy and help the body absorb vitamins.',
            'Vitamins and minerals (in fruits/veggies, milk, meat) keep the body\'s systems working well (e.g. calcium for bones).',
            'Water is also vital; about 60% of our body is water. It transports nutrients, removes waste, and helps temperature control.'
          ]
        },
        {
          type: 'image',
          src: '/lesson12image2.webp',
          alt: 'Lesson 12',
          caption: 'Fruits and supplements as sources of vitamins and minerals that help keep the body healthy.'
        },
        {
          type: 'paragraph',
          content: 'Healthy habits: eat colorful fruits/vegetables, choose whole grains, drink water, and enjoy treats only sometimes.'
        },
        {
          type: 'paragraph',
          content: 'Avoid allergies/food bugs: wash fruits before eating; only drink pasteurized juice; don\'t share utensils.'
        }
      ],
      sources: [
        {
          name: 'Britannica Kids',
          url: 'https://kids.britannica.com/kids/article/digestive-system/353054#:~:text=endocrine%20system%20and%20the%20digestive,make%20up%20the%20digestive%20system',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'EatingWell',
          url: 'https://www.eatingwell.com/article/7866255/foods-you-should-eat-every-week-to-lose-weight/',
          favicon: 'https://www.google.com/s2/favicons?domain=eatingwell.com&sz=32'
        },
        {
          name: 'EW Motion Therapy',
          url: 'https://www.ewmotiontherapy.com/blog/vitamins-essential-nutrients',
          favicon: 'https://www.google.com/s2/favicons?domain=ewmotiontherapy.com&sz=32'
        }
      ]
    },
    13: {
      sections: [
        {
          type: 'paragraph',
          content: 'Water is essential for life. About 60% of the human body is water, and every cell needs water to function. Water helps carry nutrients and oxygen to cells, and it carries wastes (like urea) away through urine. It also helps regulate body temperature (we sweat to cool down). That means we must drink enough clean water or healthy drinks (milk, juice) every day, especially when active or it\'s hot. Signs of not enough water (dehydration) include feeling very thirsty, having dark yellow urine, or feeling tired.'
        },
        {
          type: 'image',
          src: '/lesson13image1.jpg',
          alt: 'Lesson 13',
          caption: 'Water, an essential resource that supports life and keeps the body functioning properly.'
        },
        {
          type: 'bullets',
          items: [
            'Every cell in the body must be "bathed" in water to work properly. Water carries nutrients in blood, helps digest food, and helps the kidneys remove waste.',
            'Normal body processes: sweating (cooling), urinating (waste removal), and breathing all use water. We lose water this way and must replace it by drinking.',
            'Recommended: children should drink several cups of water or healthy beverages daily. Avoid too much soda or sugary drinks.'
          ]
        },
        {
          type: 'image',
          src: '/lesson13image2.webp',
          alt: 'Lesson 13',
          caption: 'Bottled drinking water, showing a source of clean water needed to keep the body hydrated and functioning.'
        },
        {
          type: 'paragraph',
          content: 'Besides water, foods like fruits and soups provide hydration.'
        },
        {
          type: 'paragraph',
          content: 'If you exercise or play hard, you should drink extra fluids to make up for sweat loss.'
        },
        {
          type: 'paragraph',
          content: 'Safety: only drink clean water. At home, that\'s usually tap or filtered water; when traveling, bottled or boiled water is safest.'
        }
      ],
      sources: [
        {
          name: 'Britannica Students',
          url: 'https://kids.britannica.com/students/article/human-anatomy/272852#:~:text=The%20human%20body%20is%20about,60%20percent%20water%20by%20weight',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'United Nations',
          url: 'https://www.un.org/en/desa/world-oceans-day-call-action-save-our-ocean',
          favicon: 'https://www.google.com/s2/favicons?domain=un.org&sz=32'
        },
        {
          name: 'Calgary Journal',
          url: 'https://calgaryjournal.ca/2019/07/15/an-in-depth-look-at-bottled-water/',
          favicon: 'https://www.google.com/s2/favicons?domain=calgaryjournal.ca&sz=32'
        }
      ]
    },
    14: {
      sections: [
        {
          type: 'paragraph',
          content: 'Exercise keeps the body strong and healthy. Regular physical activity strengthens muscles and bones, improves heart and lung function, and even boosts mood and brain power. For example, running or jumping (weight-bearing activities) make bones denser (stronger). Aerobic activities like playing tag or riding a bike make the heart pump better and the lungs breathe more efficiently. Physical activity can improve children\'s attention, memory, and overall brain health. Fun daily movement (games, sports, dance) is encouraged for at least 1 hour a day for kids. Don\'t forget to rest and drink water during exercise.'
        },
        {
          type: 'image',
          src: '/lesson14image1.jpg',
          alt: 'Lesson 14',
          caption: 'Physical exercise, showing how regular movement strengthens muscles, bones, and overall health.'
        },
        {
          type: 'bullets',
          items: [
            'Stronger muscles and bones: Activities like running, jumping, climbing (weight-bearing) build bone strength. Lifting light weights or carrying a backpack also helps.',
            'Healthy heart and lungs: Aerobic exercise (soccer, swimming, dancing) makes the heart beat stronger and improves breathing. This means more oxygen gets to muscles and brain.',
            'Better mood and learning: Exercise releases chemicals in the brain that improve mood and help with focus. Studies show kids often concentrate better after playing actively.'
          ]
        },
        {
          type: 'image',
          src: '/lesson14image2.jpg',
          alt: 'Lesson 14',
          caption: 'Outdoor running, an aerobic activity that strengthens the heart, lungs, muscles, and bones while improving mood and focus.'
        },
        {
          type: 'paragraph',
          content: 'Enjoyment: Pick activities you like (team sports, bike riding, jump rope). It\'s easier to stick with it if it\'s fun.'
        },
        {
          type: 'paragraph',
          content: 'Rest and safety: Always warm up first, wear appropriate shoes/clothing, and drink water. Rest (sleep) is also important for recovery.'
        }
      ],
      sources: [
        {
          name: 'Centers for Disease Control and Prevention',
          url: 'https://www.cdc.gov/physical-activity-basics/health-benefits/children.html#:~:text=,weight%20and%20reduce%20body%20fat',
          favicon: 'https://www.google.com/s2/favicons?domain=cdc.gov&sz=32'
        },
        {
          name: 'Men\'s Fitness',
          url: 'https://www.mensfitness.com/training/10-basic-exercises-build-workout',
          favicon: 'https://www.google.com/s2/favicons?domain=mensfitness.com&sz=32'
        },
        {
          name: 'Verywell Health',
          url: 'https://www.verywellhealth.com/benefits-of-morning-exercise-vs-evening-exercise-11792935',
          favicon: 'https://www.google.com/s2/favicons?domain=verywellhealth.com&sz=32'
        }
      ]
    },
    15: {
      sections: [
        {
          type: 'paragraph',
          content: 'Sleep is a vital time when the body and brain grow and repair. When we sleep, especially deep sleep, the body releases growth hormone that helps tissues grow. The brain also processes and stores what we learned during the day (memory consolidation). School-age children (6–12 years) generally need about 9–12 hours of sleep per night, and teenagers need about 8–10 hours. Having a routine (bedtime schedule, dark room, no screens before bed) helps us fall asleep faster and get better rest.'
        },
        {
          type: 'image',
          src: '/lesson15image1.jpg',
          alt: 'Lesson 15',
          caption: 'Sleep, a period when the body rests, repairs tissues, and the brain processes memories from the day.'
        },
        {
          type: 'bullets',
          items: [
            'Growth and repair: While we sleep, the body grows and repairs itself. Muscles recover, and bones grow. Even the immune system works better with enough sleep.',
            'Brain function: Sleep helps brain development and learning. After a good night\'s sleep, we concentrate better and remember things more easily.',
            'Recommended sleep: Children (6–12 yrs) should get about 9–12 hours; teens (13–18 yrs) about 8–10 hours. Staying up too late or using screens before bed can make it hard to fall asleep.'
          ]
        },
        {
          type: 'image',
          src: '/lesson15image2.jpeg',
          alt: 'Lesson 15',
          caption: 'A bedtime routine, highlighting the importance of regular sleep for growth, repair, and healthy brain function.'
        },
        {
          type: 'paragraph',
          content: 'Consistency: Go to bed and wake up around the same time every day (even weekends). This helps your body\'s clock.'
        },
        {
          type: 'paragraph',
          content: 'Effects of poor sleep: Without enough sleep, kids may feel tired, have trouble paying attention, and be more likely to get sick.'
        }
      ],
      sources: [
        {
          name: 'Britannica Kids',
          url: 'https://kids.britannica.com/kids/article/growth/601359#:~:text=Just%20about%20every%20living%20thing,and%20when%20to%20stop%20growing',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'National Heart, Lung, and Blood Institute',
          url: 'https://www.nhlbi.nih.gov/health/sleep/how-much-sleep#:~:text=,to%2010%20hours%20per%20day',
          favicon: 'https://www.google.com/s2/favicons?domain=nhlbi.nih.gov&sz=32'
        },
        {
          name: 'Ezra',
          url: 'https://ezra.com/blog/importance-of-sleep-for-health',
          favicon: 'https://www.google.com/s2/favicons?domain=ezra.com&sz=32'
        },
        {
          name: 'HelpGuide',
          url: 'https://www.helpguide.org/aging/healthy-aging/how-to-sleep-well-as-you-age',
          favicon: 'https://www.google.com/s2/favicons?domain=helpguide.org&sz=32'
        }
      ]
    },
    16: {
      sections: [
        {
          type: 'paragraph',
          content: 'The immune system is the body\'s defense against germs and infections. It includes barriers like skin, and internal soldiers like white blood cells and antibodies that fight invaders. For example, if bacteria or viruses enter the body, immune cells recognize them and destroy them. The immune system also "remembers" germs: after fighting an infection once, it can respond faster the next time. The immune system protects the body from antigens (germs like viruses and bacteria) and can react quicker if it has seen the germ before.'
        },
        {
          type: 'image',
          src: '/lesson16image1.jpg',
          alt: 'Lesson 16',
          caption: 'The immune system, a network of cells and organs that protects the body by detecting and fighting germs.'
        },
        {
          type: 'bullets',
          items: [
            'Defense cells: White blood cells (like lymphocytes) circulate in blood and tissues to find and destroy germs. They also make antibodies that stick to specific germs to help kill them.',
            'Memory: After an illness or vaccine, the immune system remembers the germ so it can respond faster next time (this is why you often don\'t get measles twice). Vaccines work by safely teaching the immune system about a germ beforehand.',
            'Barriers: The skin and mucous membranes (nose, throat lining) are barriers that stop many germs from entering. Coughing, sneezing, and fever are body responses that help eliminate germs.'
          ]
        },
        {
          type: 'image',
          src: '/lesson16image2.jpg',
          alt: 'Lesson 16',
          caption: 'White blood cells of the immune system, showing how defense cells detect, attack, and remember germs to protect the body from infection.'
        },
        {
          type: 'paragraph',
          content: 'Lifestyle support: Good nutrition, sleep, and exercise all help your immune system work well.'
        },
        {
          type: 'paragraph',
          content: 'Illness vs. immune reaction: Cold symptoms (runny nose, cough) are mostly caused by immune actions against the virus, not the virus itself.'
        }
      ],
      sources: [
        {
          name: 'Britannica Students',
          url: 'https://kids.britannica.com/students/article/human-anatomy/272852#:~:text=The%20immune%20system%20functions%20to,proteins%29%20that%20help%20fight',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'WK Health',
          url: 'https://www.wkhs.com/health-resources/wk-health-library/medical-procedures-tests-care-and-management/neurological/spine/the-immune-system!',
          favicon: 'https://www.google.com/s2/favicons?domain=wkhs.com&sz=32'
        },
        {
          name: 'ThoughtCo',
          url: 'https://www.thoughtco.com/types-of-white-blood-cells-373374',
          favicon: 'https://www.google.com/s2/favicons?domain=thoughtco.com&sz=32'
        }
      ]
    },
    17: {
      sections: [
        {
          type: 'paragraph',
          content: 'Germs are tiny organisms or particles that can cause sickness. Two major types are bacteria and viruses. Bacteria are single-celled living organisms; some are helpful (like gut bacteria) but others can cause illnesses (strep throat, ear infections). Viruses are smaller, non-living particles consisting of genetic material inside a protein shell. Viruses cannot reproduce by themselves; they must invade a living cell and hijack it to make more virus particles. For example, colds and flu are caused by viruses; some stomach bugs can be from bacteria. Antibiotics kill bacteria, but they do not work on viruses.'
        },
        {
          type: 'image',
          src: '/lesson17image1.webp',
          alt: 'Lesson 17',
          caption: 'Bacteria, microscopic living organisms that can be helpful or cause disease, depending on the type.'
        },
        {
          type: 'bullets',
          items: [
            'Bacteria are living cells; they can multiply on their own. Many bacteria in our gut help digest food, but others (like streptococcus) make us sick. They can be killed by antibiotics.',
            'Viruses (like cold, flu, COVID-19) are not fully alive outside cells. They infect cells to replicate. Because of this, antibiotics have no effect on viruses.',
            'Germ-fighting strategies differ: we use vaccines to prevent viral diseases and medicines (antibiotics) to treat bacterial infections. Good hygiene helps prevent both (washing hands removes both bacteria and viruses).'
          ]
        },
        {
          type: 'image',
          src: '/lesson17image2.webp',
          alt: 'Lesson 17',
          caption: 'Coronavirus, a virus that infects living cells to replicate and causes respiratory illness. It caused a nationwide outbreak in 2019, and is an example of how fast a virus can replicate.'
        },
        {
          type: 'paragraph',
          content: 'Superbugs: Overusing antibiotics can lead to bacteria that are resistant (hard to kill). That\'s why doctors prescribe antibiotics only when needed.'
        },
        {
          type: 'paragraph',
          content: 'Virus treatments: For viral illnesses, doctors often suggest rest, fluids, and over-the-counter meds for symptoms (antivirals are only for some viruses).'
        }
      ],
      sources: [
        {
          name: 'Britannica Students',
          url: 'https://kids.britannica.com/students/article/virus/277614#:~:text=consists%20of%20a%20core%20of,cell%20infected%20by%20the%20virus',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'Britannica',
          url: 'https://www.britannica.com/story/what-was-life-like-before-we-knew-about-germs',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'CEPI',
          url: 'https://cepi.net/CoV',
          favicon: 'https://www.google.com/s2/favicons?domain=cepi.net&sz=32'
        }
      ]
    },
    18: {
      sections: [
        {
          type: 'paragraph',
          content: 'Vaccines and antibiotics are tools doctors use to fight germs. Vaccines prepare the immune system to fight future infections without causing disease. A vaccine contains harmless parts of a germ (dead or weakened bacteria/virus). This "shows" the immune system a germ\'s "wanted poster" so it can make antibodies in advance. If the real germ appears later, the immune system attacks it quickly. For example, a flu vaccine helps prevent flu. Antibiotics are medicines that kill bacteria or stop their growth. They work only on bacteria, not viruses. That\'s why antibiotics cure infections like strep throat but not the common cold (a virus).'
        },
        {
          type: 'image',
          src: '/lesson18image1.jpg',
          alt: 'Lesson 18',
          caption: 'Figure 1.3 | A vaccine vial and syringe, used to safely train the immune system to recognize and fight specific germs before infection occurs.'
        },
        {
          type: 'bullets',
          items: [
            'Vaccines: Introduce dead/weakened germs (or parts) to the body so the immune system learns to fight them safely. They create immunity (antibodies) without making you sick. For instance, the chickenpox or COVID-19 vaccine trains your body to fight those viruses.',
            'Antibiotics: Drugs specifically for bacterial infections. They either kill bacteria or stop them multiplying. They do not affect viruses at all. Doctors prescribe antibiotics for things like pneumonia or strep throat, not for colds or flu.',
            'Using antibiotics correctly is important: only take them for bacterial infections and complete the course, so all bacteria are killed and resistance is avoided.'
          ]
        },
        {
          type: 'image',
          src: '/lesson18image2.webp',
          alt: 'Lesson 18',
          caption: 'Antibiotic capsules, medicines used to treat bacterial infections by killing bacteria or stopping their growth.'
        },
        {
          type: 'paragraph',
          content: 'Safety: Vaccines are tested to be safe. Side effects are usually minor (like a sore arm or mild fever). They are one of the best ways to prevent dangerous diseases.'
        },
        {
          type: 'paragraph',
          content: 'Hygiene plus medicine: Even with vaccines and antibiotics, handwashing and clean habits help prevent germs in the first place.'
        }
      ],
      sources: [
        {
          name: 'Britannica Students',
          url: 'https://kids.britannica.com/students/article/vaccine/277531#:~:text=The%20principle%20of%20vaccination%20is,be%20either%20active%20or%20passive',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'Google Search',
          url: 'https://www.google.com/search?q=vaccine&sca_esv=6e231c42ce1b23dd&udm=2&biw=1440&bih=751&ei=XYtFabynC8_h4-EPisWbqAg&ved=0ahUKEwj8yZrOlsqRAxXP8DgGHYriBoUQ4dUDCBI&uact=5&oq=vaccine&gs_lp=Egtnd3Mtd2l6LWltZyIHdmFjY2luZTINEAAYgAQYsQMYQxiKBTIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABEiBC1CnBFiNCnABeACQAQCYAVWgAdIEqgEBOLgBA8gBAPgBAZgCCKACkgTCAgoQABiABBhDGIoFwgIGEAAYBxgewgILEAAYgAQYsQMYgwHCAggQABiABBixA8ICDhAAGIAEGLEDGIMBGIoFwgILEAAYgAQYsQMYigXCAgwQABiABBixAxgKGAuYAwCIBgGSBwE4oAfjJ7IHATe4B48EwgcDMC44yAcQgAgA&sclient=gws-wiz-img#sv=CAMSVhoyKhBlLUZidlNTU2RCU3dhcXRNMg5GYnZTU1NkQlN3YXF0TToOa3RiQ09DdWpraXpvWU0gBCocCgZtb3NhaWMSEGUtRmJ2U1NTZEJTd2FxdE0YADABGAcgvr_u5wYwAkoKCAIQAhgCIAIoAg',
          favicon: 'https://www.google.com/s2/favicons?domain=google.com&sz=32'
        },
        {
          name: 'The Pharmaceutical Journal',
          url: 'https://pharmaceutical-journal.com/article/news/frequent-and-intermittent-antibiotics-have-limited-benefit-researchers-say',
          favicon: 'https://www.google.com/s2/favicons?domain=pharmaceutical-journal.com&sz=32'
        }
      ]
    },
    19: {
      sections: [
        {
          type: 'paragraph',
          content: 'Teeth are hard structures in your mouth used for biting and chewing food. Humans have different types of teeth: incisors (front teeth for cutting), canines (sharp teeth for tearing), and molars (back teeth for grinding). We first have baby teeth that fall out, then permanent teeth come in. In the mouth, bacteria combine with food particles to form a sticky film called plaque. The bacteria in plaque produce acids that can eat away tooth enamel, causing cavities (holes). Good habits prevent this: brushing teeth twice a day with fluoride toothpaste, flossing, and limiting sugary snacks help remove plaque. Dentists also check and clean teeth to catch problems early.'
        },
        {
          type: 'image',
          src: '/lesson19image1.webp',
          alt: 'Lesson 19',
          caption: 'Human teeth, used for biting, tearing, and grinding food during chewing.'
        },
        {
          type: 'bullets',
          items: [
            'Teeth let us chew food into smaller pieces. Strong enamel (outer coating) protects teeth, but it can be damaged by plaque acids. Cavities happen when enamel breaks down.',
            'Cavities (tooth decay): Bacteria + sugary food form plaque; acids from plaque dissolve enamel, forming holes. If untreated, cavities can hurt and lead to infections. Brushing and flossing remove plaque before it causes decay.',
            'Healthy gums and teeth: also floss regularly to clean between teeth, and visit the dentist for check-ups and cleanings. Fluoride in toothpaste and water helps strengthen enamel.'
          ]
        },
        {
          type: 'image',
          src: '/lesson19image2.jpg',
          alt: 'Lesson 19',
          caption: 'A tooth cavity (decay) caused by acids from plaque damaging the tooth enamel.'
        },
        {
          type: 'paragraph',
          content: 'Milk and calcium: Teeth (and bones) need calcium to stay strong. Dairy or fortified alternatives supply calcium and vitamin D.'
        },
        {
          type: 'paragraph',
          content: 'Baby teeth are important: they help children chew and talk, and they hold space for adult teeth. Protect them too (no sharing utensils with baby teeth).'
        }
      ],
      sources: [
        {
          name: 'MedlinePlus',
          url: 'https://medlineplus.gov/toothdecay.html#:~:text=Our%20mouths%20are%20full%20of,gums%20and%20cause%20gum%20disease',
          favicon: 'https://www.google.com/s2/favicons?domain=medlineplus.gov&sz=32'
        },
        {
          name: 'Crystalline Dental',
          url: 'https://crystallinedental.com/how-many-teeth-do-adults-have/',
          favicon: 'https://www.google.com/s2/favicons?domain=crystallinedental.com&sz=32'
        },
        {
          name: 'McDonald Family Dentistry',
          url: 'https://www.dentistofmorganhill.com/how-to-prevent-cavities-what-you-should-know/',
          favicon: 'https://www.google.com/s2/favicons?domain=dentistofmorganhill.com&sz=32'
        }
      ]
    },
    20: {
      sections: [
        {
          type: 'paragraph',
          content: 'Puberty is the time when the body becomes capable of reproduction. During puberty (around ages 10–14), many changes happen under the skin. Boys and girls develop sex organs: males have testes (in the scrotum) that begin making sperm; females have ovaries (inside the body) that release an egg each month. Hormones like estrogen and testosterone cause visible changes: voice deepens in boys, facial hair grows, and testes produce sperm daily; girls develop breasts, start menstrual periods as an egg is released monthly (menstruation). These changes prepare the body for making babies later. It\'s important to understand these changes and stay clean (like taking showers and wearing clean clothes) as the body becomes more sensitive.'
        },
        {
          type: 'image',
          src: '/lesson20image1.webp',
          alt: 'Lesson 20',
          caption: 'Acne is a common change during puberty, caused by hormonal changes increasing oil production in the skin.'
        },
        {
          type: 'bullets',
          items: [
            'Reproductive organs: Males have testes (in scrotum) that produce sperm and hormones; females have ovaries that produce eggs. These organs also produce sex hormones (testosterone in boys, estrogen in girls).',
            'Puberty changes: Boys grow facial/body hair, their penis/testes grow, and voice deepens. Girls develop breasts, wider hips, and start periods (monthly shedding of the uterine lining if no pregnancy). These are normal and natural.',
            'Reproduction basics: An egg and sperm can join (fertilize) to start a baby\'s development. The fertilized egg implants in the uterus and grows into a baby over nine months.'
          ]
        },
        {
          type: 'image',
          src: '/lesson20image2.webp',
          alt: 'Lesson 20',
          caption: 'Fertilisation occurs when a sperm cell meets and enters an egg, beginning the development of a baby.'
        },
        {
          type: 'paragraph',
          content: 'Privacy and care: During puberty, people often need more privacy and should practice good hygiene (daily bathing, deodorant for body odor, menstrual supplies for girls).'
        },
        {
          type: 'paragraph',
          content: 'Emotional changes: Puberty also affects emotions and thinking (due to hormones). It\'s normal to feel mood swings or new feelings.'
        }
      ],
      sources: [
        {
          name: 'Britannica Students',
          url: 'https://kids.britannica.com/students/article/human-anatomy/272852#:~:text=The%20basic%20organs%20of%20the,tract%20for%20urine%20and%20semen',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'Modibodi',
          url: 'https://www.modibodi.co.nz/blogs/womens/when-does-puberty-end?srsltid=AfmBOoq23LcOMifrplOP8uVP-po4DL9r22X_uXhNB6KlYdps5L72nEPW',
          favicon: 'https://www.google.com/s2/favicons?domain=modibodi.co.nz&sz=32'
        },
        {
          name: 'UCSF Health',
          url: 'https://www.ucsfhealth.org/education/conception-how-it-works',
          favicon: 'https://www.google.com/s2/favicons?domain=ucsfhealth.org&sz=32'
        }
      ]
    },
    21: {
      sections: [
        {
          type: 'paragraph',
          content: 'DNA is the instruction manual inside cells that carries hereditary information. It is packed into chromosomes (thread-like structures) in nearly every cell. Genes are segments of DNA that carry information for specific traits (like eye color or hair color). Genes are the basic units of heredity that control how we grow and what we look like. We inherit our genes from our parents (half from each). That\'s why children often look like mom or dad. Not all traits are the same: you might have your mother\'s eye color and your father\'s height. This is because different genes control different traits.'
        },
        {
          type: 'image',
          src: '/lesson21image1.webp',
          alt: 'Lesson 21',
          caption: 'DNA is a double-helix molecule made of four bases (A, T, C, G) arranged along a sugar-phosphate backbone. The order of these bases forms genes, which carry instructions for inherited traits passed from parents to children.'
        },
        {
          type: 'bullets',
          items: [
            'Every person\'s DNA is unique, but half of it comes from the mother\'s egg and half from the father\'s sperm. This mixing of genes makes you related but also unique.',
            'Genes provide the "plan" for all body parts. For example, genes determine whether you have brown or blue eyes. They also influence height, blood type, and even some health risks.',
            'Heredity means inherited traits: hair type, eye color, and even things like earlobe shape are passed down by genes. Environment and lifestyle also play a role, so you might not look exactly like anyone, but genetics set the blueprint.'
          ]
        },
        {
          type: 'image',
          src: '/lesson21image2.webp',
          alt: 'Lesson 21',
          caption: 'DNA carries genetic instructions that determine inherited traits passed from parents to children.'
        },
        {
          type: 'paragraph',
          content: 'Genetic variation: Everyone\'s genes are mixed in unique ways, so each person is different. Even identical twins have almost the same genes, which is why they look very alike.'
        },
        {
          type: 'paragraph',
          content: 'Genetics and health: Some conditions (like some types of diabetes or color blindness) are inherited. Knowing family medical history can be important.'
        }
      ],
      sources: [
        {
          name: 'Britannica Kids',
          url: 'https://kids.britannica.com/kids/article/growth/601359#:~:text=Every%20plant%20and%20animal%20follows,that%20make%20up%20living%20things',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'Visible Body',
          url: 'https://www.visiblebody.com/learn/biology/dna-chromosomes/dna-structure',
          favicon: 'https://www.google.com/s2/favicons?domain=visiblebody.com&sz=32'
        },
        {
          name: 'Britannica',
          url: 'https://www.britannica.com/science/DNA',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        }
      ]
    },
    22: {
      sections: [
        {
          type: 'paragraph',
          content: 'Hormones are chemical messengers in the body. They are produced by glands (called the endocrine system) and travel through the blood to organs and cells, telling them what to do. Hormones tell cells and body parts to do certain things. For example, insulin (from the pancreas) tells body cells to take in sugar; growth hormone (from the pituitary gland) tells the body to grow; adrenaline (from adrenal glands) triggers the "fight or flight" response (increases heart rate). During puberty, sex hormones (estrogen, testosterone) cause the body changes we discussed earlier.'
        },
        {
          type: 'image',
          src: '/lesson22image1.webp',
          alt: 'Lesson 22',
          caption: 'Hormones are chemical messengers that travel in the blood and tell the body how to grow, use energy, and respond to changes.'
        },
        {
          type: 'bullets',
          items: [
            'Glands (pituitary, thyroid, pancreas, adrenal, etc.) release hormones into the bloodstream. Each hormone has target cells. For example, insulin (pancreas) regulates blood sugar. Growth hormone (pituitary) stimulates growth of bones and muscles. Thyroid hormones control metabolism (how quickly we use energy).',
            'Hormones act slower than nerves (circulating in blood), but they have long-lasting effects. They regulate growth, metabolism, water balance, and more.',
            'The endocrine system keeps the body in balance. For instance, after eating, insulin lowers blood glucose; if blood sugar drops, another hormone (glucagon) raises it.'
          ]
        },
        {
          type: 'image',
          src: '/lesson22image2.svg',
          alt: 'Lesson 22',
          caption: 'Hormones are released by glands into the blood and control things like growth, energy use, and blood sugar balance.'
        },
        {
          type: 'paragraph',
          content: 'Balance: Hormone levels are very carefully controlled by feedback loops. For example, when blood sugar rises, insulin is released; when sugar falls, insulin stops.'
        },
        {
          type: 'paragraph',
          content: 'Health tip: Problems in hormones can cause conditions (e.g., diabetes from insulin issues, hyperthyroidism from too much thyroid hormone). Eating well and seeing doctors helps manage them.'
        }
      ],
      sources: [
        {
          name: 'Britannica Students',
          url: 'https://kids.britannica.com/students/article/kidney/275267#:~:text=All%20active%20forms%20of%20life,in%20the%20form%20of%20urine',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'Children with Diabetes',
          url: 'https://childrenwithdiabetes.com/living-with-diabetes/for-kids-what-is-diabetes/#:~:text=ImageDiabetes%20is%20a%20condition%20where,they%20are%20in%20your%20body',
          favicon: 'https://www.google.com/s2/favicons?domain=childrenwithdiabetes.com&sz=32'
        },
        {
          name: 'Fitbook',
          url: 'https://www.fitbook.de/gesundheit/was-sind-hormone-und-wie-wirken-sie',
          favicon: 'https://www.google.com/s2/favicons?domain=fitbook.de&sz=32'
        },
        {
          name: 'Nagwa',
          url: 'https://www.nagwa.com/en/explainers/248126942828/',
          favicon: 'https://www.google.com/s2/favicons?domain=nagwa.com&sz=32'
        }
      ]
    },
    23: {
      sections: [
        {
          type: 'paragraph',
          content: 'Hygiene means keeping clean to stay healthy. Simple habits like washing hands with soap and water are among the best ways to prevent illness. We should wash hands before eating, after using the bathroom, and after playing outside or sneezing. Other hygiene practices: bathe or shower regularly, brush teeth daily (oral hygiene), and keep nails and clothes clean. Cover coughs and sneezes with your elbow or a tissue (to stop spreading germs). Good hygiene complements the immune system by reducing the germs that enter the body.'
        },
        {
          type: 'image',
          src: '/lesson23image1.jpg',
          alt: 'Lesson 23',
          caption: 'Hygiene means keeping clean to stop germs from spreading, like washing hands with soap, bathing regularly, and brushing teeth.'
        },
        {
          type: 'bullets',
          items: [
            'Washing hands removes germs you might have picked up from surfaces or other people. Soap, water, and scrubbing (20 seconds) physically wash away viruses and bacteria.',
            'Good personal hygiene: regular bathing keeps skin and hair clean; wearing clean clothes; brushing teeth and flossing remove germs from your mouth (which can cause illness or cavities).',
            'Keeping your environment clean helps too: cover your nose/mouth when coughing or sneezing, throw tissues away, and clean toys or phones regularly.'
          ]
        },
        {
          type: 'image',
          src: '/lesson23image2.jpeg',
          alt: 'Lesson 23',
          caption: 'Showering washes away sweat, dirt, and germs, helping keep the body clean and healthy.'
        },
        {
          type: 'paragraph',
          content: 'Community hygiene: Stay home and rest if you\'re very sick to avoid passing germs to others (especially important with contagious diseases).'
        },
        {
          type: 'paragraph',
          content: 'Hygiene myth: Bathing too often can dry out skin. Typically, a daily shower or bath and daily handwashing are ideal.'
        }
      ],
      sources: [
        {
          name: 'Centers for Disease Control and Prevention',
          url: 'https://www.cdc.gov/clean-hands/about/index.html#:~:text=Having%20clean%20hands%20is%20one,spread%20of%20germs%20to%20others',
          favicon: 'https://www.google.com/s2/favicons?domain=cdc.gov&sz=32'
        },
        {
          name: 'Southern Living',
          url: 'https://www.southernliving.com/uses-for-bar-of-soap-8780469',
          favicon: 'https://www.google.com/s2/favicons?domain=southernliving.com&sz=32'
        },
        {
          name: 'Condé Nast Traveler',
          url: 'https://www.cntraveler.com/story/what-is-an-emotional-shower',
          favicon: 'https://www.google.com/s2/favicons?domain=cntraveler.com&sz=32'
        }
      ]
    },
    24: {
      sections: [
        {
          type: 'paragraph',
          content: 'Allergies happen when the immune system overreacts to a harmless substance (allergen) like pollen, pet dander, or certain foods. Normally, these things don\'t hurt us, but in allergies our body treats them like dangerous invaders. The immune system creates special antibodies to fight the allergen. When exposed again, these antibodies cause symptoms. For example, if you\'re allergic to pollen, breathing it in makes your immune system release histamine, causing sneezing and itchy eyes. Common allergens include dust mites, pollen, animal fur, or foods like peanuts. Allergies can make you sneeze, itch, or get a rash, but they are not contagious. They\'re managed by avoiding the trigger or using medicine (like antihistamines) to block the reaction.'
        },
        {
          type: 'image',
          src: '/lesson24image1.jpg',
          alt: 'Lesson 24',
          caption: 'Nut allergies are very common, especially in children. About 1-2% of kids have a peanut or tree-nut allergy, and reactions can be serious.'
        },
        {
          type: 'bullets',
          items: [
            'When the immune system misidentifies a harmless substance as a threat, it produces antibodies to fight it. This causes allergy symptoms (sneezing, runny nose, hives, etc.).',
            'Histamine is a chemical released during an allergic reaction. It makes blood vessels swell, mucus form, and causes itching or swelling (e.g. watery eyes with pollen allergy).',
            'Allergic reactions range from mild (sneezing) to severe (anaphylaxis, which is life-threatening swelling, for example from a peanut allergy). Anaphylaxis requires immediate medical care (EpiPen, etc.).'
          ]
        },
        {
          type: 'image',
          src: '/lesson24image2.jpeg',
          alt: 'Lesson 24',
          caption: 'Allergies are immune overreactions to harmless things, causing sneezing, itching, or swelling.'
        },
        {
          type: 'paragraph',
          content: 'Allergy management: Keep windows closed when pollen is high, clean your room to reduce dust, and read labels to avoid food allergens.'
        },
        {
          type: 'paragraph',
          content: 'Immune system note: Allergies mean the immune system is working (perhaps too well!), showing how it can sometimes make mistakes.'
        }
      ],
      sources: [
        {
          name: 'Britannica Kids',
          url: 'https://kids.britannica.com/kids/article/allergy/352736#:~:text=Several%20things%20happen%20to%20cause,to%20fight%20the%20pollen%E2%80%99s%20effects',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'California State Capitol Museum',
          url: 'https://capitolmuseum.ca.gov/state-symbols/nuts-almond-walnut-pistachio-pecan/',
          favicon: 'https://www.google.com/s2/favicons?domain=capitolmuseum.ca.gov&sz=32'
        },
        {
          name: 'Northeast Allergy, Asthma, and Immunology',
          url: 'https://neaai.com/what-to-do-when-you-cant-stop-sneezing/',
          favicon: 'https://www.google.com/s2/favicons?domain=neaai.com&sz=32'
        }
      ]
    },
    25: {
      sections: [
        {
          type: 'paragraph',
          content: 'Asthma is a condition that affects the lungs and breathing. During an asthma attack, the airways (small tubes in the lungs) narrow and fill with mucus, making it hard to breathe. Muscles around the airways tighten (called bronchoconstriction), the lining of the airways swells, and more mucus is produced. This leads to symptoms like coughing, wheezing (a whistling sound when breathing), and feeling out of breath. Asthma attacks can be triggered by exercise, cold air, allergens (like pollen or dust), or illness. People with asthma use inhalers: one type (bronchodilator) quickly opens airways during an attack, another type (steroid) prevents inflammation. With proper care and avoiding triggers, most people with asthma can control their symptoms.'
        },
        {
          type: 'image',
          src: '/lesson25image1.webp',
          alt: 'Lesson 25',
          caption: 'Asthma narrows the airways, making breathing hard. Inhalers help open those lungs and ease breathing.'
        },
        {
          type: 'bullets',
          items: [
            'Asthma attacks happen because the small tubes in the lungs become too narrow. Muscle spasms and swelling plus mucus block airflow.',
            'Symptoms: coughing (often at night), wheezing (whistling breath sound), chest tightness, and trouble taking full breaths.',
            'Triggers: exercise (exercise-induced asthma), cold air, allergens (dust mites, pet dander, mold), smoke, or respiratory infections can trigger an attack. Sometimes stress or strong emotions can too.'
          ]
        },
        {
          type: 'image',
          src: '/lesson25image2.png',
          alt: 'Lesson 25',
          caption: 'In asthma, the airways tighten and swell with mucus, reducing airflow. This causes wheezing, coughing, and shortness of breath.'
        },
        {
          type: 'paragraph',
          content: 'Medication: Rescue inhalers (like albuterol) act fast to open airways. Controllers (like inhaled steroids) reduce long-term inflammation but are taken daily.'
        },
        {
          type: 'paragraph',
          content: 'Lifestyle: Not smoking and avoiding secondhand smoke is critical, as smoke is a strong trigger. Staying active and healthy helps (with doctor\'s guidance).'
        }
      ],
      sources: [
        {
          name: 'Britannica Kids',
          url: 'https://kids.britannica.com/kids/article/asthma/390237#:~:text=An%20asthma%20attack%20results%20from,with%20extra%20amounts%20of%20a',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'The Pharmaceutical Journal',
          url: 'https://pharmaceutical-journal.com/article/news/lung-disease-patients-still-dont-use-inhalers-properly',
          favicon: 'https://www.google.com/s2/favicons?domain=pharmaceutical-journal.com&sz=32'
        },
        {
          name: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Asthma',
          favicon: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=32'
        }
      ]
    },
    26: {
      sections: [
        {
          type: 'paragraph',
          content: 'Cancer is a disease where some of the body\'s cells begin to grow and divide uncontrollably. Normally, cells grow in a controlled way, but cancer happens when a cell\'s DNA is damaged and it ignores the rules. That cell keeps multiplying and can form a mass called a tumor. Cancer cells can invade nearby tissues and sometimes spread (metastasize) to other parts of the body. Importantly, cancer is not contagious – you cannot catch cancer from someone else. Cancer can affect people of any age (children and adults) and many types exist (for example, leukemia is cancer of blood cells, sarcoma affects bone or muscle). Treatment may include surgery (removing tumors), chemotherapy (drugs that kill fast-growing cells), radiation therapy, or other approaches. Early detection and treatment increase chances of cure.'
        },
        {
          type: 'image',
          src: '/lesson26image1.jpg',
          alt: 'Lesson 26',
          caption: 'Cancer happens when damaged cells grow and divide uncontrollably. These cells can form tumors and sometimes spread to other parts of the body.'
        },
        {
          type: 'bullets',
          items: [
            'Cancer starts from changes (mutations) in a cell\'s genes that control growth. This abnormal cell divides too fast and doesn\'t die when it should.',
            'Tumors can be benign (non-cancerous) or malignant (cancerous). Malignant tumors invade nearby tissue. Cancer cells can travel through blood or lymph and form new tumors elsewhere (metastasis).',
            'Treatments: Surgery can remove localized tumors; chemotherapy drugs target rapidly dividing cells; radiation targets tumors with high-energy beams. Modern medicine is constantly improving treatments.'
          ]
        },
        {
          type: 'image',
          src: '/lesson26image2.webp',
          alt: 'Lesson 26',
          caption: 'Cancer treatment uses methods like radiation, chemotherapy, or surgery to destroy or remove cancer cells. These treatments aim to stop cancer from growing and spreading.'
        },
        {
          type: 'paragraph',
          content: 'Prevention: Some cancers can be prevented (avoid smoking, sun protection, vaccines for viruses like HPV). Healthy habits (diet, exercise) may lower some risks.'
        },
        {
          type: 'paragraph',
          content: 'Survival: Not all tumors are deadly. Many people survive cancer, especially when found early. Support from doctors, family, and healthy choices help.'
        }
      ],
      sources: [
        {
          name: 'KidsHealth',
          url: 'https://www.kidshealth.org.nz/childhood-cancer/what-is-cancer#:~:text=way',
          favicon: 'https://www.google.com/s2/favicons?domain=kidshealth.org.nz&sz=32'
        },
        {
          name: 'ScienceAlert',
          url: 'https://www.sciencealert.com/cancer',
          favicon: 'https://www.google.com/s2/favicons?domain=sciencealert.com&sz=32'
        },
        {
          name: 'Willamette Valley Cancer Institute',
          url: 'https://www.oregoncancer.com/blog/pros-and-cons-of-treating-cancer-with-radiation-therapy',
          favicon: 'https://www.google.com/s2/favicons?domain=oregoncancer.com&sz=32'
        }
      ]
    },
    27: {
      sections: [
        {
          type: 'paragraph',
          content: 'Sometimes an organ (like a kidney or heart) fails and cannot heal on its own. Doctors can save lives by transplanting a healthy organ from a donor. A donor can be living or deceased. For example, people can donate one kidney (we have two) or part of their liver and still live normally. Organs like heart, lungs, or corneas usually come from deceased donors (who have agreed or whose families agreed to donate). The transplanted organ goes into the patient (recipient). After transplant, the body might see the new organ as "foreign," so the patient takes special medicines (immunosuppressants) to prevent rejection. These medicines reduce the immune response so the organ can work. Organ transplant is a complex but life-saving procedure.'
        },
        {
          type: 'image',
          src: '/lesson27image1.webp',
          alt: 'Lesson 27',
          caption: 'Organ transplants replace a failed organ with a healthy one from a donor. After surgery, patients take medicines to stop the body from rejecting the new organ.'
        },
        {
          type: 'bullets',
          items: [
            'Donors: A living person can donate some organs (kidney, part of liver) if it\'s safe for them. Organs from deceased donors (cadavers) include heart, lungs, liver, kidneys, pancreas. Organs must be matched (blood type, tissue type) to reduce rejection.',
            'Transplant surgery: The new organ replaces the failing one. For example, a patient without working kidneys can receive a healthy kidney and then produce urine again.',
            'Rejection and meds: The immune system usually fights off foreign tissues. To stop it, transplant patients take immunosuppressant drugs so the body accepts the organ. These must be taken carefully for life.'
          ]
        },
        {
          type: 'image',
          src: '/lesson27image2.jpeg',
          alt: 'Lesson 27',
          caption: 'Organ transplants use healthy organs from donors to replace ones that have failed. After surgery, patients take medicines to stop their immune system from rejecting the new organ.'
        },
        {
          type: 'paragraph',
          content: 'Tissue donation: Besides organs, tissues like corneas (for vision), skin (for burns), and bone marrow (for blood diseases) can also be donated.'
        },
        {
          type: 'paragraph',
          content: 'Gift of life: Organ donation saves lives. Discussing donation wishes with family and registering as a donor can help others.'
        }
      ],
      sources: [
        {
          name: 'Britannica Students',
          url: 'https://kids.britannica.com/students/article/tissue-transplantation/277413#:~:text=Organ%20Transplants',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'Ohio State Health & Discovery',
          url: 'https://health.osu.edu/health/general-health/transplant-organs',
          favicon: 'https://www.google.com/s2/favicons?domain=health.osu.edu&sz=32'
        },
        {
          name: 'MedlinePlus',
          url: 'https://medlineplus.gov/organtransplantation.html',
          favicon: 'https://www.google.com/s2/favicons?domain=medlineplus.gov&sz=32'
        }
      ]
    },
    28: {
      sections: [
        {
          type: 'paragraph',
          content: 'Doctors have tools to see inside the body without surgery. X-rays are one common tool: they are powerful rays that pass through soft tissues but are blocked by dense bones. On an X-ray image, bones appear white and soft tissues dark. For example, an X-ray can show if a bone is broken or if a swallowed object is in the chest. Other imaging methods: MRI (magnetic resonance imaging) uses magnetic fields and radio waves to image organs (no radiation); ultrasound uses sound waves (like in pregnancy to see a baby). These images help diagnose injuries or illnesses (fractures, lung infections, blockages, even seeing babies before birth) without cutting the body open.'
        },
        {
          type: 'image',
          src: '/lesson28image1.jpg',
          alt: 'Lesson 28',
          caption: 'Medical imaging lets doctors see inside the body without surgery. X-rays show bones and chest problems, while MRI and ultrasound give detailed pictures of organs using magnets or sound waves.'
        },
        {
          type: 'bullets',
          items: [
            'X-ray: A quick imaging method for bones and some chest exams. It uses a small dose of radiation to create an image. Bones show up clearly.',
            'MRI: Uses magnets; great for soft tissues (brain, spinal cord, joints) to see details. No radiation is used, but it takes longer.',
            'Ultrasound: Safe (sound waves) and real-time; shows images of internal organs (kidneys, liver) and baby in uterus. It\'s often used for prenatal care.',
            'Imaging is crucial: it helps doctors know if a bone is broken, if pneumonia is in lungs, or how big an organ is. It guides treatment without invasive surgery.'
          ]
        },
        {
          type: 'image',
          src: '/lesson28image2.webp',
          alt: 'Lesson 28',
          caption: 'MRI uses strong magnets to make detailed images of soft tissues like the brain and joints. It doesn\'t use radiation, but scans take longer.'
        },
        {
          type: 'paragraph',
          content: 'Safety: Doctors use the lowest radiation dose possible for X-rays. Protective shields (like aprons) protect other parts.'
        },
        {
          type: 'paragraph',
          content: 'Interpretation: A trained radiologist or doctor must read the images. You should always let doctors know if you might be pregnant before X-rays or CT scans.'
        }
      ],
      sources: [
        {
          name: 'Britannica Students',
          url: 'https://kids.britannica.com/students/article/tissue-transplantation/277413#:~:text=Organ%20Transplants',
          favicon: 'https://www.google.com/s2/favicons?domain=britannica.com&sz=32'
        },
        {
          name: 'MedlinePlus',
          url: 'https://medlineplus.gov/xrays.html',
          favicon: 'https://www.google.com/s2/favicons?domain=medlineplus.gov&sz=32'
        },
        {
          name: 'Metropolis Healthcare',
          url: 'https://www.metropolisindia.com/blog/preventive-healthcare/mri-scan',
          favicon: 'https://www.google.com/s2/favicons?domain=metropolisindia.com&sz=32'
        }
      ]
    }
  }

  return contentMap[lessonId] || null
}

export default {
  getLessonContent
}

