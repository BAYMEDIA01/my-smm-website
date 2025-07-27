document.addEventListener('DOMContentLoaded', function() {
    // --- Header Scroll Effect ---
    // This function adds a 'scrolled' class to the header when the user scrolls down.
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // --- Scroll-in animations ---
    // This reveals elements as they enter the viewport.
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            // Reveal element when it's 100px from the bottom of the viewport
            if (elementTop < windowHeight - 100) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    // Initial check on page load to reveal elements already in view
    revealOnScroll();

    // --- Gemini API Integration for Plan Finder ---
    // This section handles the logic for the AI-powered plan recommender.
    const findPlanBtn = document.getElementById('find-plan-btn');
    const businessGoalInput = document.getElementById('business-goal');
    const businessStageInput = document.getElementById('business-stage');
    const aiLoading = document.getElementById('ai-loading');
    const aiResults = document.getElementById('ai-results');
    const planOutput = document.getElementById('plan-output');
    const aiFormContainer = document.getElementById('ai-form-container');

    if (findPlanBtn) {
        findPlanBtn.addEventListener('click', findPlan);
    }

    async function findPlan() {
        // Ensure all elements exist before proceeding
        if (!businessGoalInput || !businessStageInput || !aiFormContainer || !aiLoading || !aiResults || !planOutput) {
            console.error("One or more AI Plan Finder elements are missing from the DOM.");
            return;
        }

        const goal = businessGoalInput.value;
        const stage = businessStageInput.value;

        // Show loader and hide form
        aiFormContainer.classList.add('hidden');
        aiLoading.classList.remove('hidden');
        aiLoading.classList.add('flex');
        aiResults.classList.add('hidden');

        // The prompt provides context and instructions to the Gemini model.
        const prompt = `
            As an expert consultant for the 'FLUX MEDIA' social media agency, your task is to recommend one of our two subscription plans to a potential client based on their answers to a few questions. The two plans are:
            - **The Launchpad Plan:** Ideal for new brands building a foundation. Includes management of 2 social media accounts (Facebook, Instagram), 15 curated posts per month, a basic content calendar, 6 high-quality motion graphics reels (12-15s), and custom graphic design.
            - **The Growth Accelerator Plan:** For established brands ready to scale. Includes management of 3 social media platforms (Facebook, Instagram, YouTube), 25-30 dynamic posts, an advanced content calendar and strategic planning, proactive community management, 6 high-quality motion graphics reels (20-30s), 1 long-form YouTube video, and custom graphic design.

            Here is the client's information:
            - **Primary Goal:** ${goal}
            - **Current Social Media Stage:** ${stage}

            Based on this information, recommend ONLY ONE plan. Start your response with the recommended plan name in bold (e.g., "**The Growth Accelerator Plan**"). Then, provide a concise, 2-3 sentence justification explaining WHY that plan is the best fit, directly referencing their stated goal and stage.
        `;

        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = ""; // API key is handled by the environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                
                const text = result.candidates[0].content.parts[0].text;
                planOutput.innerText = text; 
                aiResults.classList.remove('hidden');

            } else {
                throw new Error('Unexpected API response structure.');
            }

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            planOutput.innerText = "Sorry, we couldn't generate a recommendation at this time. Please try again later.";
            aiResults.classList.remove('hidden');
        } finally {
            // Hide loader and show form again for another attempt
            aiLoading.classList.add('hidden');
            aiLoading.classList.remove('flex');
            aiFormContainer.classList.remove('hidden');
        }
    }
    
    // --- Mute/Unmute for Intro Video ---
    // This handles the custom mute/unmute button on the introduction video.
    const introVideo = document.getElementById('intro-video');
    const muteBtn = document.getElementById('mute-btn');
    const muteIcon = document.getElementById('mute-icon');
    const unmuteIcon = document.getElementById('unmute-icon');

    if (introVideo && muteBtn && muteIcon && unmuteIcon) {
        muteBtn.addEventListener('click', () => {
            introVideo.muted = !introVideo.muted;
            if (introVideo.muted) {
                unmuteIcon.classList.remove('hidden');
                muteIcon.classList.add('hidden');
            } else {
                unmuteIcon.classList.add('hidden');
                muteIcon.classList.remove('hidden');
            }
        });
    }
});
