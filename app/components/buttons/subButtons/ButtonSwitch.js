import React, { useState } from 'react';

function ButtonSwitch() {
   const [selected, setSelected] = useState('Enterprise');

   const handleButtonClick = (selection) => {
      setSelected(selection);
   };

   return (
      <>
         <div className='bg-mainColor-tertiary translate-x-1 translate-y-1 rounded-xl'>
            <div className='flex bg-white rounded-xl p-2 shadow-lg border-2 border-mainColor-tertiary -translate-x-1 -translate-y-1'>
               <button
                  className={`${selected === 'Enterprise'
                        ? 'bg-mainColor-primary text-white'
                        : 'text-mainColor-tertiary'
                     } font-medium py-4 px-12 rounded-xl text-xl`}
                  onClick={() => handleButtonClick('Enterprise')}
               >
                  Enterprise
               </button>
               <div className='mx-1' />
               <button
                  className={`${selected === 'Personal'
                        ? 'bg-mainColor-primary text-white'
                        : 'text-mainColor-tertiary'
                     } font-medium py-4 px-12 rounded-xl text-xl`}
                  onClick={() => handleButtonClick('Personal')}
               >
                  Personal
               </button>
            </div>
         </div>
      </>
   );
}

export default ButtonSwitch;
