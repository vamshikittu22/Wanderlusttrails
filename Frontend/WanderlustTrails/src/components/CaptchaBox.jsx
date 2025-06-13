import React from 'react';
import $ from 'jquery'; // Ensure jQuery is imported

function CaptchaBox({ onVerify }) {
    const [captchaValue, setCaptchaValue] = React.useState('');
    const [userInput, setUserInput] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const fetchCaptcha = () => {
        setIsLoading(true);
        console.log('Fetching CAPTCHA from: http://localhost/WanderlustTrails/Backend/config/captcha/generateCaptcha.php');
        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/captcha/generateCaptcha.php',
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                console.log('Fetch CAPTCHA Response:', response);
                if (response.success && response.captcha) {
                    setCaptchaValue(response.captcha);
                    setErrorMessage('');
                    if (onVerify) onVerify(false);
                } else {
                    setErrorMessage('Failed to load CAPTCHA: ' + (response.message || 'No CAPTCHA received'));
                }
            },
            error: function (xhr) {
                let errorMessage = `Error fetching CAPTCHA: ${xhr.status} ${xhr.statusText}`;
                try {
                    const response = JSON.parse(xhr.responseText || '{}');
                    errorMessage += ` - ${response.message || 'Server error'}`;
                } catch (e) {
                    errorMessage += ' - Unable to parse server response';
                }
                console.error('Error fetching CAPTCHA:', errorMessage, 'Response Headers:', xhr.getAllResponseHeaders());
                setErrorMessage(errorMessage);
            },
            complete: function () {
                setIsLoading(false);
            }
        });
    };

    const handleVerify = () => {
        setIsLoading(true);
        console.log('Verifying CAPTCHA - User Input:', userInput, 'vs CAPTCHA:', captchaValue);
        const isValid = userInput.trim().toLowerCase() === captchaValue.toLowerCase();
        if (isValid) {
            setErrorMessage('');
            if (onVerify) onVerify(true);
        } else {
            setErrorMessage('Invalid CAPTCHA. Please try again.');
            if (onVerify) onVerify(false);
            fetchCaptcha(); // Refresh CAPTCHA on failure
        }
        setIsLoading(false); // Always stop loading
    };

    React.useEffect(() => {
        fetchCaptcha();
    }, []);

    return (
        <div className="p-4 border border-gray-300 rounded-lg shadow-md bg-gray-400" style={{ minWidth: '300px' }}>
            <h3 className="text-lg font-semibold text-center mb-4">CAPTCHA Verification</h3>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-gray-800 p-2 border border-gray-300 rounded font-mono text-center w-32">
                        {isLoading ? 'Loading...' : captchaValue || 'No CAPTCHA'}
                    </div>
                    <button
                        type="button"
                        onClick={fetchCaptcha}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                        disabled={isLoading}
                    >
                        Refresh
                    </button>
                </div>
                <input
                    className="text-black border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                    type="text"
                    name="captcha"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Enter CAPTCHA"
                    required
                    disabled={isLoading}
                />
                <button
                    type="button"
                    onClick={handleVerify}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors w-full"
                    disabled={isLoading}
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