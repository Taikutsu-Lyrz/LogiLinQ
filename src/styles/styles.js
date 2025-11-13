// --- Styles (CSS-in-JS using CSS Variables) ---
// Colors are now defined in the CSS stylesheet block at the bottom
const styles = {
    appContainer: {
        fontFamily: '"Inter", "Noto Sans Arabic", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        margin: '0 auto',
        padding: '0',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text-primary)',
        transition: 'background-color 0.3s ease, color 0.3s ease', // Theme transition
    },
    content: {
        padding: '24px',
    },
    header: {
        padding: '16px 24px',
        backgroundColor: 'var(--color-surface)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'left',
        borderBottom: 'none',
        transition: 'background-color 0.3s ease',
    },
    headerInner: { // To hold title and theme switch
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
    },
    themeToggleButton: { // Theme switch button style
        padding: '8px 16px',
        fontSize: '0.9rem',
        fontWeight: '600',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text-secondary)',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
        whiteSpace: 'nowrap',
    },
    headerTitle: {
        margin: 0,
        fontSize: '1.75rem',
        color: 'var(--color-primary)',
        fontWeight: '600',
    },
    headerSubtitle: {
        margin: 0,
        fontSize: '0.9rem',
        color: 'var(--color-text-secondary)',
    },
    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    dashboardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid var(--color-border)`,
        paddingBottom: '16px',
        paddingTop: '16px', // ADDED
        position: 'relative', // CHANGED
    },
    menuButton: { // Style for the hamburger button
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        color: 'var(--color-primary)',
    },
    pageTitle: {
        margin: 0,
        fontWeight: '600',
        fontSize: '1.5rem',
        color: 'var(--color-text-primary)',
    },
    pageText: {
        margin: '8px 0 0',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.5',
    },
    dashboardLayout: {


    },
    sidebarNav: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '220px',
        flexShrink: 0,
    },
    navButton: {
        padding: '12px 16px',
        fontSize: '0.95rem',
        fontWeight: '600',
        border: 'none',
        borderRadius: '8px',
        // backgroundColor, color, and transition moved to index.css
        cursor: 'pointer',
        // textAlign: 'left', // <-- THIS IS REMOVED
        display: 'block',
    },

    navButtonActive: {
        backgroundColor: 'var(--color-primary)',
        color: 'white',
    },


    mainContent: {
        overflowY: 'auto',
        flex: 1,
        minWidth: 0,
        marginTop: '24px',
    },
    overviewGrid: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',

    },
    formCard: {
        flex: '1',
        backgroundColor: 'var(--color-surface)',
        border: 'none',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        // alignSelf: 'flex-start',

    },
    listCard: {
        flex: '1',
        backgroundColor: 'var(--color-surface)',
        border: 'none',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        // alignSelf: 'flex-start',


    },
    statCardContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
    },
    statCard: {
        backgroundColor: 'var(--color-surface)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    statValue: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: 'var(--color-primary)',
        margin: 0,
    },
    statLabel: {
        fontSize: '1rem',
        color: 'var(--color-text-secondary)',
        margin: '4px 0 0 0',
    },
    aiRecapCard: {
        backgroundColor: 'var(--color-surface)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    aiRecapText: {
        whiteSpace: 'pre-wrap',
        lineHeight: '1.6',
        color: 'var(--color-text-primary)',
        backgroundColor: 'var(--color-background)',
        padding: '16px',
        borderRadius: '8px',
        marginTop: '20px',
    },
    successBox: {
        backgroundColor: 'var(--color-success-light)',
        border: `1px solid var(--color-success)`,
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px',
        textAlign: 'center',
        animation: 'fadeInOut 3s ease-in-out forwards',
    },
    successText: {
        color: 'var(--color-success)',
        fontWeight: '600',
        margin: 0,
    },
    card: {
        backgroundColor: 'var(--color-surface)',
        border: 'none',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '24px', // <-- ADD THIS
    },

    // --- VVV THIS IS THE NEW, CORRECTED CODE VVV ---
    // ... (after card style)

    // --- VVV THIS IS THE NEW, CORRECTED CODE VVV ---
    loginCardContainer: {
        display: 'flex',
        width: '100%',
        maxWidth: '900px', // Max width of the whole login box
        minHeight: '600px', // Give the card a nice height
        margin: '1px auto 0', // Centered with more top margin
        backgroundColor: 'var(--color-surface)',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        overflow: 'hidden', // Keeps the corners rounded
    },
    // ...
    // ...
    loginCardIllustration: {
        flex: '0 0 40%',
        // The 'background' property is GONE.
        // We set the other properties here, but the image itself in index.css
        backgroundSize: 'contain',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        order: 2, // Puts it on the RIGHT
    },
    loginCardForm: {
        flex: '1 1 60%',
        padding: '32px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        order: 1, // <-- CHANGED (Puts it on the LEFT)

    },
    // ...
    // ...
    // --- ^^^ END OF NEW STYLES ^^^ ---

    // --- ^^^ END OF NEW STYLES ^^^ ---

    cardTitle: {
        marginTop: 0,
        borderBottom: `1px solid var(--color-border)`,
        paddingBottom: '12px',
        marginBottom: '20px',
        fontSize: '1.25rem',
        fontWeight: '600',
    },
    subCardTitle: {
        marginTop: '20px',
        marginBottom: '12px',
        fontSize: '1.1rem',
        color: 'var(--color-primary)',
        borderBottom: `1px solid var(--color-border)`,
        paddingBottom: '8px',
        fontWeight: '600',
    },

    // ... (after subCardTitle)

    stepperContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: `1px solid var(--color-border)`,
    },
    stepItem: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        color: 'var(--color-text-secondary)',
        opacity: 0.5,
        flex: 1,
    },

    stepItemActive: {
        // This style gets merged when the step is active
        color: 'var(--color-primary)',
        opacity: 1,
        fontWeight: '600',
    },
    stepNumber: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'var(--color-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
        fontWeight: '600',
        border: '2px solid var(--color-border)',
    },
    stepNumberActive: {
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        border: '2px solid var(--color-primary-dark)',
    },
    stepLabel: {
        fontSize: '0.85rem',
        textAlign: 'center',
    },
    stepNavButtons: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '20px',
    },

    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '16px',
    },
    label: {
        marginTop: '12px',
        fontSize: '0.9rem',
        color: 'var(--color-text-secondary)',
        marginBottom: '4px',
        display: 'block',
        fontWeight: '600',
    },
    button: {
        padding: '14px 24px',
        fontSize: '1rem',
        fontWeight: '600',
        border: 'none',
        borderRadius: '8px',
        backgroundImage: `linear-gradient(to bottom, var(--color-surface), var(--color-secondary))`,
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease, background-image 0.2s ease',
    },
    buttonPrimary: {
        padding: '16px 28px',
        fontSize: '1rem',
        border: 'none',
        borderRadius: '8px',
        backgroundImage: `linear-gradient(to bottom, var(--color-primary), var(--color-primary-dark))`,
        color: 'white',
        cursor: 'pointer',
        textAlign: 'center',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease, background-image 0.2s ease',
        marginTop: '10px',
    },
    buttonSecondary: {
        padding: '12px 20px',
        fontSize: '0.9rem',
        border: 'none',
        borderRadius: '8px',
        backgroundImage: `linear-gradient(to bottom, var(--color-surface), var(--color-secondary))`,
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        textAlign: 'center',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease, background-image 0.2s ease',
    },
    buttonWarning: {
        padding: '16px 28px',
        fontSize: '1rem',
        border: 'none',
        borderRadius: '8px',
        backgroundImage: `linear-gradient(to bottom, var(--color-error), var(--color-error-dark))`,
        color: 'white',
        cursor: 'pointer',
        textAlign: 'center',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease, background-image 0.2s ease',
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        marginTop: '10px'
    },
    actionButton: {
        padding: '8px 12px',
        fontSize: '0.85rem',
        fontWeight: '600',
        border: 'none',
        borderRadius: '6px',
        color: 'white',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease, background-image 0.2s ease',
    },
    editButton: { backgroundImage: `linear-gradient(to bottom, var(--color-edit), var(--color-edit-dark))` },
    deleteButton: { backgroundImage: `linear-gradient(to bottom, var(--color-delete), var(--color-error-dark))` },
    deleteConfirmButton: { backgroundImage: `linear-gradient(to bottom, var(--color-warning), var(--color-warning-dark))`, color: 'black' },
    trackButton: { backgroundImage: `linear-gradient(to bottom, var(--color-track), var(--color-track-dark))` },
    completeButton: { backgroundImage: `linear-gradient(to bottom, var(--color-complete), var(--color-complete-dark))` },
    printButton: { backgroundImage: `linear-gradient(to bottom, var(--color-print), var(--color-print-dark))` },
    actionButtonGroup: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginTop: '10px',
    },
    roleSelectionContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginTop: '20px',
    },
    roleButtonCard: {
        padding: '30px 20px',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        backgroundColor: 'var(--color-surface)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        color: 'var(--color-text-primary)',
    },
    list: {
        listStyleType: 'none',
        padding: 0,
        margin: 0,
    },
    listItem: {
        padding: '12px 0',
        borderBottom: `1px solid var(--color-border)`,
    },
    listItemDetails: {
        fontSize: '0.9rem',
        color: 'var(--color-text-secondary)',
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '8px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        gap: '16px',
        color: 'var(--color-text-secondary)',
    },
    spinner: {
        border: `4px solid var(--color-border)`,
        borderTop: `4px solid var(--color-primary)`,
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
    },
    errorBox: {
        backgroundColor: 'var(--color-error-light)',
        border: `1px solid var(--color-error)`,
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px',
    },
    errorText: {
        color: 'var(--color-error)',
        wordBreak: 'break-word',
        fontSize: '0.9rem',
        margin: '4px 0',
    },
    mapContainer: {
        width: '100%',
        height: '300px',
        backgroundColor: 'var(--color-background)',
        borderRadius: '8px',
        marginTop: '10px',
    },
    separator: {
        fontSize: '0.9rem',
        color: 'var(--color-text-secondary)',
        textAlign: 'center',
        margin: '20px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    toggleButton: {
        background: 'none',
        border: 'none',
        color: 'var(--color-primary)',
        cursor: 'pointer',
        padding: '8px',
        marginTop: '16px',
        fontSize: '0.9rem',
        fontWeight: '600',
        alignSelf: 'center',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'var(--color-surface)',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        width: '90%',
        maxWidth: '700px',
        zIndex: 1001,
        maxHeight: '90vh', // <-- ADD THIS (Max height is 90% of the screen)
        overflowY: 'auto',  // <-- ADD THIS (Make the modal itself scroll)
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid var(--color-border)`,
        paddingBottom: '12px',
        marginBottom: '20px',
    },
    modalTitle: {
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: '600',
    },
    modalCloseButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: 'var(--color-text-secondary)',
    },
    // ... (your modalCloseButton style)

    // --- VVV PASTE THIS ENTIRE BLOCK VVV ---
    printArea: {
        display: 'none',
    },
    printPage: {
        padding: '20mm',
        fontSize: '12pt',
        lineHeight: 1.4,
    },
    printHeader: {
        textAlign: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid black',
        paddingBottom: '10px',
    },
    printSection: {
        marginTop: '20px',
    },
    printSectionTitle: {
        fontWeight: 'bold',
        fontSize: '14pt',
        borderBottom: '1px solid #ccc',
        paddingBottom: '5px',
        marginBottom: '10px',
    },
    printGrid: {
        display: 'grid',
        gridTemplateColumns: '150px 1fr',
        gap: '5px 15px',
    },
    printLabel: {
        fontWeight: 'bold',
    },
    printValue: {},
    printDriverPhoto: {
        width: '100px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '4px',
        border: '1px solid #ccc'
    },


    signaturePad: {
        border: '2px solid var(--color-border)',
        borderRadius: '8px',
        width: '100%',
        height: '200px',
        backgroundColor: 'var(--color-background)',
    },
    signatureImage: {
        width: '100%',
        maxWidth: '300px',
        height: 'auto',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        backgroundColor: 'white',
        marginTop: '10px',
    }

};

export default styles;
