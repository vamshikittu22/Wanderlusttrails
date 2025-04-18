//path: Frontend/WanderlustTrails/src/components/currencyconverter/InputBox.jsx
import React, {useId} from 'react'

function InputBox({
    label,
    amount,
    onAmountChange,
    onCurrencyChange,
    currencyOptions = [],
    selectedCurrency = "usd",
    amountDisabled = false,
    currrencyDisabled = false,
    className = "",
}) {

    const id = useId()
  return (
    <div className={`bg-white p-3 rounded-lg text-sm flex ${className}`}>
        <div className='w-1-2'>
            <label htmlFor={id}  className='text-purple-600 font-bold mb-2 inline-block'>{label}</label>
            <input 
            id={id}
            type="number"
            className='border-2 border-gray-300 outline outline-double outline-blue-500 text-left text-green-600 w-full py-1.5'
            placeholder='Amount'    
            disabled={amountDisabled}
            value={amount}
            onChange={(e) => onAmountChange && onAmountChange(Number(e.target.value))}
             />
        </div>
        <div className='w-1/2 flex flex-wrap justify-end text-right'>
        <p className="text-black mb-2 w-full font-semibold">Currency Type</p>
        <select 
        className='rounded-lg px-1 py-1 bg-gray-600 text-orange-600 cursor-pointer outline-none'
        value={selectedCurrency}
        onChange={(e) => { onCurrencyChange && onCurrencyChange(e.target.value)}}
        disabled={currrencyDisabled}
        >
            {currencyOptions.map((currency) => (
                <option key={currency} value={currency}>{currency}</option>
            ))}
        </select>
        </div>
    </div>
  )
}

export default InputBox