import React, { useState } from 'react';
import styles from '../../styles/styles';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const AiRecapTab = ({ shipments }) => {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [recapText, setRecapText] = useState('');
    const [error, setError] = useState('');

    const handleGenerateRecap = async () => {
        if (!shipments || shipments.length === 0) {
            setError("You don't have any shipment data to analyze.");
            return;
        }

        setLoading(true);
        setError('');
        setRecapText('');

        try {
            const simplifiedData = shipments.map(s => ({
                id: s.shipmentId,
                status: s.status,
                driver: s.driver?.name || 'N/A',
                receiver: s.receiver?.name || 'N/A',
                goods: s.goods?.name || 'N/A'
            }));

            // Uses Vite environment variable for API key security
            // Don't forget to set VITE_PERPLEXITY_API_KEY in your .env file
            const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
            if (!apiKey) {
                setError(t('sender.ai.noKey'));
                setLoading(false);
                return;
            }

            // --- 2Dynamic prompts ---
            const currentLanguage = i18n.language.startsWith('fa') ? 'Persian' : 'English';
            const systemPrompt = t('sender.ai.systemPrompt', { language: currentLanguage });
            const userPrompt = t('sender.ai.userPrompt', { data: JSON.stringify(simplifiedData) });

            // --- Perplexity endpoint ---
            const apiUrl = "https://api.perplexity.ai/chat/completions";

            const payload = {
                model: "sonar", // Or "sonar-pro", depending on your access
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
            };

            // --- Retry logic ---
            let response;
            let attempts = 0;
            const maxAttempts = 5;
            let delay = 1000;

            while (attempts < maxAttempts) {
                try {
                    response = await fetch(apiUrl, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${apiKey}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    });
                    if (response.ok) break;
                    if (response.status === 429 || response.status >= 500) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                        delay *= 2;
                        attempts++;
                    } else {
                        const errData = await response.json();
                        console.error("Perplexity API Error Response:", errData);
                        throw new Error(errData.error?.message || `API request failed with status ${response.status}`);
                    }
                } catch (fetchError) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                    attempts++;
                    if (attempts >= maxAttempts) {
                        throw new Error(`Network error after ${maxAttempts} attempts: ${fetchError.message}`);
                    }
                }
            }

            if (!response || !response.ok) {
                throw new Error(`API request failed after ${maxAttempts} attempts with status ${response?.status || 'unknown'}`);
            }

            const result = await response.json();

            // ---  Extract response text ---
            const recap = result.choices?.[0]?.message?.content;

            if (recap) {
                setRecapText(recap);
            } else {
                console.error("Unexpected Perplexity API response structure:", result);
                setError(t('error.generic'));
            }

        } catch (err) {
            console.error("Error generating Perplexity AI recap:", err);
            setError(`Failed to generate recap: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.aiRecapCard}>
            <h3 style={styles.cardTitle}>{t('sender.ai.title')}</h3>
            <p style={styles.pageText}>{t('sender.ai.desc')}</p>
            <button
                style={styles.buttonPrimary}
                onClick={handleGenerateRecap}
                disabled={loading}
                className="buttonPrimary"
            >
                {loading ? <LoadingSpinner /> : t('sender.ai.btn')}
            </button>

            {error && <p style={{ ...styles.errorText, marginTop: '20px' }}>{error}</p>}

            {recapText && (
                <div>
                    <h4 style={{ ...styles.subCardTitle, marginTop: '30px' }}>{t('sender.ai.summary')}</h4>
                    <p style={styles.aiRecapText}>{recapText}</p>
                </div>
            )}
        </div>
    );
};

export default AiRecapTab;
