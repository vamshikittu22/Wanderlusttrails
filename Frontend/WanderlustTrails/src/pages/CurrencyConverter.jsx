// path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/currencyConverter.jsx
import { useState } from 'react'
import useCurrencyInfo from '../hooks/useCurrencyInfo.js'
import { InputBox } from '../components/currencyconverter/index.js'
import currency from '../assets/Images/currency.jpg'

function CurrencyConverter() {
  // State to hold the input amount to convert
  const [amount, setAmount] = useState(0)
  // State for source currency code
  const [from, setFrom] = useState('usd')
  // State for target currency code
  const [to, setTo] = useState('inr')
  // State for the result of the currency conversion
  const [convertedAmount, setConvertedAmount] = useState(0)

  // Custom hook to fetch exchange rates based on the 'from' currency
  const currencyInfo = useCurrencyInfo(from)
  // Extract currency codes from fetched exchange rate data for dropdown options
  const options = Object.keys(currencyInfo)

  // Function to swap the "from" and "to" currencies and their amounts
  const swap = () => {
    setFrom(to)
    setTo(from)
    setConvertedAmount(amount)  // Set converted amount to previous input amount
    setAmount(convertedAmount)  // Set input amount to previous converted amount
  }

  // Function to calculate the converted amount using current rates
  const convert = () => {
    setConvertedAmount(amount * currencyInfo[to])
  }

  return (
    // Main container with full screen height and background image
    <div
      className='w-full h-screen flex flex-wrap justify-center items-center bg-cover bg-no-repeat'
    >
      {/* Background image with opacity */}
      <img
        src={currency}
        alt="Currency Background"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />

      {/* Title section */}
      <div className='text-red-600 font-bold text-2xl '>
        <h3>Choose the currency-type of your choice to know the value</h3>
      </div>

      {/* Converter form container */}
      <div className='w-full '>
        <div className='w-full max-w-md mx-auto border border-gray-60 rounded-lg p-5 backdrop-blur-sm bg-transparent'>
          {/* Form with submit handler to convert currency */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              convert()
            }}
          >
            {/* Input for source currency and amount */}
            <div className='w-full mb-1 text-gray-700'>
              <InputBox
                className=' bg-slate-200 font-bold'
                label="from"
                amount={amount}
                currencyOptions={options}
                onCurrencyChange={(currency) => setFrom(currency)}
                onAmountChange={(amount) => setAmount(amount)}
                selectedCurrency={from}
              />
            </div>

            {/* Swap button to switch currencies */}
            <div className='relative w-full h-0.5'>
              <button
                className='absolute left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-md bg-gray-600 text-white px-2 py-0.5'
                onClick={swap}
              >
                Swap
              </button>
            </div>

            {/* Output for converted currency and amount (disabled input) */}
            <div className='w-full mb-1'>
              <InputBox
                className='font-bold'
                label="to"
                currencyOptions={options}
                amount={convertedAmount}
                onCurrencyChange={(currency) => setTo(currency)}
                selectedCurrency={to}
                amountDisabled
              />
            </div>

            {/* Submit button to trigger conversion */}
            <button
              type='submit'
              className='w-full bg-orange-600 text-white px-4 py-3 rounded-lg'
            >
              Convert {from.toUpperCase()} to {to.toUpperCase()}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CurrencyConverter
