import React, { useState } from 'react';
import styles from '../../styles/styles';
import { useTranslation } from 'react-i18next';

// --- Stepper Component ---
const Stepper = ({ currentStep }) => {
    const { t } = useTranslation();
    const steps = [
        t('sender.form.step1'),
        t('sender.form.step2'),
        t('sender.form.step3')
    ];

    return (
        <div style={styles.stepperContainer}>
            {steps.map((label, index) => {
                const step = index + 1;
                const isActive = step === currentStep;
                const isComplete = step < currentStep;
                let stepItemStyle = styles.stepItem;
                if (isActive || isComplete) {
                    stepItemStyle = {...stepItemStyle, ...styles.stepItemActive};
                }
                let stepNumberStyle = styles.stepNumber;
                if (isActive || isComplete) {
                    stepNumberStyle = {...stepNumberStyle, ...styles.stepNumberActive};
                }
                return (
                    <div key={step} style={stepItemStyle}>
                        <div style={stepNumberStyle}>{isComplete ? '✓' : step}</div>
                        <div style={styles.stepLabel}>{label}</div>
                    </div>
                );
            })}
        </div>
    );
};
// --- END: Stepper Component ---


const isValidEmail = (email) => {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};


const OverviewTab = ({
                         error,
                         setError,
                         formData,
                         handleFormChange,
                         editingShipmentId,
                         handleCreateOrUpdateShipment,
                         resetForm,
                         showSuccess,
                         isSubmitting
                     }) => {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(1);


    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.receiverName) return setError(t('error.form.receiverName'));
            if (!isValidEmail(formData.receiverEmail)) return setError(t('error.form.receiverEmailInvalid'));
        }
        if (currentStep === 2) {
            if (!formData.driverName) return setError(t('error.form.driverName'));
            if (!isValidEmail(formData.driverEmail)) return setError(t('error.form.driverEmailInvalid'));
        }
        setError('');
        setCurrentStep(prev => prev + 1);
    };


    const prevStep = () => {
        setError('');
        setCurrentStep(prev => prev - 1);
    };


    // This runs *before* calling the parent function
    const handleSubmit = (e) => {
        e.preventDefault(); // Stop the form from submitting normally

        // Final validation for step 3
        if (!formData.goodsName) {
            return setError(t('error.form.goodsName'));
        }

        // If all validation passes, call the function from the parent
        handleCreateOrUpdateShipment(e);
    }

    const handleEnterOnLastInput = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (currentStep < 3) {
                nextStep();
            } else {
                const submitButton = event.target.form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.click();
                }
            }
        }
    };

    return (
        <div style={styles.formCard}>
            <h3 style={styles.cardTitle}>{editingShipmentId ? t('sender.form.edit') : t('sender.form.create')}</h3>

            <Stepper currentStep={currentStep} />


            <form onSubmit={handleSubmit} style={styles.form}>

                <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                    <h4 style={styles.subCardTitle}>{t('sender.form.step1')}</h4>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.receiverName')}</label><input type="text" name="receiverName" value={formData.receiverName || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} /></div>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.receiverEmail')}</label><input type="email" name="receiverEmail" value={formData.receiverEmail || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} /></div>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.receiverPhone')}</label><input type="tel" name="receiverPhone" value={formData.receiverPhone || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} /></div>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.company')}</label><input type="text" name="receiverCompany" value={formData.receiverCompany || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} /></div>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.address')}</label><input
                        type="text" name="receiverAddress" value={formData.receiverAddress || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting}
                        onKeyDown={handleEnterOnLastInput}
                    /></div>
                </div>

                <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                    <h4 style={styles.subCardTitle}>{t('sender.form.step2')}</h4>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.driverName')}</label><input type="text" name="driverName" value={formData.driverName || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} /></div>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.driverEmail')}</label><input type="email" name="driverEmail" value={formData.driverEmail || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} /></div>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.driverId')}</label><input type="text" name="driverId" value={formData.driverId || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} /></div>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.driverPhone')}</label><input type="tel" name="driverPhone" value={formData.driverPhone || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} /></div>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.carPlate')}</label><input type="text" name="driverCarPlate" value={formData.driverCarPlate || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} /></div>
                    {/*<div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.photoUrl')}</label><input type="text" name="driverPhotoUrl" value={formData.driverPhotoUrl || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} /></div>*/}
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.driverFee')}</label><input
                        type="number" name="driverFee" value={formData.driverFee || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting}
                        onKeyDown={handleEnterOnLastInput}
                    /></div>
                </div>

                <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                    <h4 style={styles.subCardTitle}>{t('sender.form.step3')}</h4>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.goodsName')}</label><input type="text" name="goodsName" value={formData.goodsName || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} /></div>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.goodsType')}</label><input type="text" name="goodsType" value={formData.goodsType || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting} onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} /></div>
                    <div style={styles.inputGroup}><label style={styles.label}>{t('sender.form.goodsWeight')}</label><input
                        type="number" name="goodsWeight" value={formData.goodsWeight || ''} onChange={handleFormChange} style={styles.input} disabled={isSubmitting}
                        onKeyDown={handleEnterOnLastInput}
                    /></div>
                </div>

                {showSuccess && (
                    <div style={styles.successBox}>
                        <p style={styles.successText}>{t('sender.form.success')}</p>
                    </div>
                )}
                {error && <div style={{marginTop: '16px'}}><p style={styles.errorText}>{error}</p></div>}

                <div style={styles.stepNavButtons}>
                    {currentStep > 1 ? (
                        <button
                            type="button"
                            onClick={prevStep}
                            style={styles.button}
                            className="button"
                            disabled={isSubmitting}
                        >
                            {t('sender.form.previous')}
                        </button>
                    ) : (
                        <div />
                    )}

                    {currentStep < 3 && (
                        <button
                            type="button"
                            onClick={nextStep}
                            style={styles.buttonPrimary}
                            className="buttonPrimary"
                        >
                            {t('sender.form.next')}
                        </button>
                    )}

                    {currentStep === 3 && (
                        <button
                            type="submit"
                            style={styles.buttonPrimary}
                            className="buttonPrimary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? t('sender.form.saving') : (editingShipmentId ? t('sender.form.update') : t('sender.form.createBtn'))}
                        </button>
                    )}
                </div>

                {editingShipmentId && (
                    <div style={{marginTop: '10px', textAlign: 'center'}}>
                        <button
                            type="button"
                            onClick={resetForm}
                            style={styles.toggleButton}
                            disabled={isSubmitting}
                        >
                            {t('sender.form.cancel')}
                        </button>
                    </div>
                )}

            </form>
        </div>
    );
};

export default OverviewTab;