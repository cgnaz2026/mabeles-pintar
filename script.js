/* Enjin Audio Stabil untuk GitHub Pages */
function toggleSpeak(text, buttonEl, rate = 0.85, pitch = 1.1) {
    initAudioEngine();

    if (activeSpeakerBtn === buttonEl && isSpeakingState) {
        stopAudio();
        return;
    }

    stopAudio();
    if (!text) return;

    const cleanText = text.trim();
    if (!cleanText) return;

    isSpeakingState = true;
    if (buttonEl) setSpeakerPlaying(buttonEl);

    // 1. Cuba guna ResponsiveVoice (Indonesian / Malay) jika ada
    if (typeof responsiveVoice !== 'undefined') {
        responsiveVoice.speak(cleanText, "Indonesian Female", {
            rate: rate,
            pitch: pitch,
            onend: function () {
                stopAudio();
            },
            onerror: function () {
                fallbackWebSpeech(cleanText, rate, pitch);
            }
        });
        return;
    }

    // 2. Jika tiada ResponsiveVoice, guna Web Speech API tempatan
    fallbackWebSpeech(cleanText, rate, pitch);
}

function fallbackWebSpeech(cleanText, rate, pitch) {
    if (!('speechSynthesis' in window)) {
        playSynthPhonicBeep(cleanText);
        stopAudio();
        return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Utamakan Suara Bahasa Melayu, jika tiada guna Bahasa Indonesia
    const voice = getMalayVoice();
    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
    } else {
        utterance.lang = 'ms-MY';
    }

    utterance.onend = () => {
        stopAudio();
    };

    utterance.onerror = () => {
        playSynthPhonicBeep(cleanText);
        stopAudio();
    };

    try {
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        playSynthPhonicBeep(cleanText);
        stopAudio();
    }
}