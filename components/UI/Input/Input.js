import React from 'react'

function isInvalid({valid, touched, shouldValidate}) {
    return !valid && shouldValidate && touched
}

const Input = props => {
    const inputType = props.type || 'text';
    const cls = ['Input'];
    const htmlFor = `${inputType}-${Math.random()}`;

    if (isInvalid(props)) {
        cls.push('invalid');
    }

    return (
        <div className={cls.join(' ')}>
            <label htmlFor={htmlFor}>{props.label}</label>
            <input
                type={inputType}
                id={htmlFor}
                value={props.value}
                onChange={props.onChange}
            />

            {
                isInvalid(props)
                    ? <span>{props.errorMessage || 'Введите верное значение'}</span>
                    : null
            }

            <style jsx>{`
                  .Input {
                margin-bottom: 15px;
            }
            
            .Input label {
                margin-bottom: 1rem;
                padding: 0;
                display: block;
                font-weight: bold;
            }
            
            .Input input {
                display: block;
                box-sizing: border-box;
                border: 1px solid #bebebe;
                padding: 7px;
                margin: 0 0 5px;
                width: 100%;
                outline: none;
                transition: all 300ms ease-in-out;
                font-size: 1.5rem;
            }
            
            .Input span {
                color: #f01f30;
                font-size: 1rem;
            }           
      `}</style>
        </div>
    )
};

export default Input