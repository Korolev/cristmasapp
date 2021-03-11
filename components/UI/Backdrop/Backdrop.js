import React from 'react'

const Backdrop = props => <div className={'Backdrop'} onClick={props.onClick} >
    {props.children}
    <style jsx>{`
        .Backdrop {
            z-index: 50;
            background: rgba(0, 0, 0, .99);
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            display: flex;            
        }
    `}</style>
</div>;

export default Backdrop