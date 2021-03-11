import React from 'react'

const Button = props => {
    const cls = [
        'Button',
        props.type,
        props.size ? 'Button_' + props.size : ''
    ];

    return (
        <>
            <button
                onClick={props.onClick}
                className={cls.join(' ')}
                disabled={props.disabled}
            >
                {props.children}
            </button>
            <style jsx>{`
              .Button {
                  display: inline-block;
                  padding: 10px 20px;
                  border-radius: 4px;
                  border: 1px solid #ccc;
                  color: #000;
                  margin-right: 15px;
                  text-transform: uppercase;
                  font-weight: bold;
                  font-size: 12px;
                  user-select: none;
              }
              
              .Button:focus {
                  outline: none;
              }
              
              .Button:active {
                  box-shadow: 0px 2px 0px rgba(0, 0, 0, .3);                  
                  
              }
              
              .Button:disabled {
                  background: #ccc;
                  color: #000;
                  cursor: not-allowed;
              }
              
              .error {
                  background: rgba(240, 87, 108, 1);
              }
              
              .success {
                  background: rgba(161, 240, 69, 1);
              }
              
              .primary {
                  background: #2884f6;
                  color: #fff;
              }  
              
              .Button_l {
                    font-size: 1rem;
                    padding: 2rem 1rem;
              }
              
              .Button_xl {
                    font-size: 2rem;
                    height: 80vw;
                    width: 80vw;
                    margin: 0 0 10px 5px;
                    border-radius: 50%; 
                    box-shadow: -4px 10px 0px rgba(0, 0, 0, .6);
                    background: rgb(131,58,180);
                    background: radial-gradient(circle, rgba(131,58,180,1) 0%, rgba(253,29,29,1) 50%, rgba(252,176,69,1) 100%);
              }
              
              .Button_xl:active {
                    margin: 10px 5px 0 0;
              }
          `}</style>
        </>
    )
};

export default Button