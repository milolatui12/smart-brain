import React from 'react';

const Rank  = ({name, entries}) => {
    return (
        <div>
            {`${name}, your rank is`}
            <div className='white f3'> 
                {entries}
            </div>
        </div>
    );
}

export default Rank;