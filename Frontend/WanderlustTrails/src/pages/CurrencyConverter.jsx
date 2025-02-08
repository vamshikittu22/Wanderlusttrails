import { useState } from 'react'
import useCurrencyInfo from '../hooks/useCurrencyInfo.js'
import {InputBox} from '../components/currencyconverter/index.js'
import currency from '../assets/Images/currency.jpg'

function CurrencyConverter() {
  const [amount, setAmount] = useState(0)
  const [from, setFrom] = useState('usd')
  const [to, setTo] = useState('inr')
  const [convertedAmount, setConvertedAmount] = useState(0)

  const currencyInfo = useCurrencyInfo(from)
  const options = Object.keys(currencyInfo)

  const swap = () => {
    setFrom(to)
    setTo(from)
    setConvertedAmount(amount)
    setAmount(convertedAmount)
  }

  const convert = () => {
    setConvertedAmount(amount * currencyInfo[to])
  }

  return (
    <div className='w-full h-screen flex flex-wrap justify-center items-center bg-cover bg-no-repeat'
    >
    <img
    src={currency}
    alt="Currency Background"
    className="absolute inset-0 h-full w-full object-cover opacity-40"
    />
    
       <div className='text-red-600 font-bold text-2xl '>
           <h3>Choose the currency-type of your choice to know the value</h3>  
        </div>

      <div className='w-full '>
        <div className='w-full max-w-md mx-auto border border-gray-60 rounded-lg p-5 backdrop-blur-sm bg-transparent'>
          <form onSubmit={(e) => {
            e.preventDefault()
            convert()
          }}>

            <div className='w-full mb-1 text-gray-700'>
              <InputBox className=' bg-slate-200 font-bold'
              label="from"
              amount={amount}
              currencyOptions={options}
              onCurrencyChange={(currency) => setFrom(currency)}
              onAmountChange={(amount) => setAmount(amount)}
              selectedCurrency={from}
              />
            </div>
            <div className='relative w-full h-0.5'>
              <button
              className='absolute left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-md bg-gray-600 text-white px-2 py-0.5'
              onClick={swap}
              >Swap</button>
            </div>
            <div className='w-full mb-1'>
              <InputBox className='font-bold'
              label="to"
              currencyOptions={options}
              amount={convertedAmount}
              onCurrencyChange={(currency) => setTo(currency)}
              selectedCurrency={to}
              amountDisabled
              />
            </div>
            <button
            type='submit'
            className='w-full bg-orange-600 text-white px-4 py-3 rounded-lg'
            >Convert {from.toUpperCase()} to {to.toUpperCase()}</button>
          </form>
        </div>
      </div>

    </div>
  )
}


export default CurrencyConverter