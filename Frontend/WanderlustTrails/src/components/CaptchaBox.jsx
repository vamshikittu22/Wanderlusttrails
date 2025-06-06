import React from 'react';

function CaptchaBox({ onVerify }) {
    // State for CAPTCHA value, user input, and error message
    const [captchaValue, setCaptchaValue] = React.useState('');
    const [userInput, setUserInput] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    // Generate random alphanumeric CAPTCHA
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let value = '';
        for (let i = 0; i < 6; i++) {
            value += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaValue(value);
        setUserInput('');
        setErrorMessage('');
        if (onVerify) onVerify(false); // Reset verification status
    };

    // Verify CAPTCHA
    const handleVerify = () => {
        if (userInput === captchaValue) {
            setErrorMessage('');
            if (onVerify) onVerify(true); // Notify parent of successful verification
            // generateCaptcha(); // Generate new CAPTCHA
        } else {
            setErrorMessage('Invalid CAPTCHA. Please try again.');
            if (onVerify) onVerify(false); // Notify parent of failed verification
        }
    };

    // Generate initial CAPTCHA on component mount
    React.useEffect(() => {
        generateCaptcha();
    }, []);

    return (
        <div className="p-4 border border-gray-300 rounded-lg shadow-md bg-gray-400">
            <h3 className="text-lg font-semibold text-center mb-4">CAPTCHA Verification</h3>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-gray-800 p-2 border border-gray-300 rounded font-mono text-center w-32">
                        {captchaValue}
                    </div>
                    <button
                        type="button"
                        onClick={generateCaptcha}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
                <input
                    className="text-black border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    type="text"
                    name="captcha"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter CAPTCHA"
                    required
                />
                <button
                    type="button"
                    onClick={handleVerify}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                    Verify
                </button>
                {errorMessage && (
                    <div className="text-red-500 text-sm text-center">
                        {errorMessage}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CaptchaBox;