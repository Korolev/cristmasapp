import React from 'react';

const Layout = props => {
    return (
        <>
            <div className="main">
                {props.children}
            </div>
            <style jsx global>{`
                html, body{
                    height: 100%;
                    overflow:hidden;
                }
                
                body {
                    background: #0F2027;  /* fallback for old browsers */
                    background: -webkit-linear-gradient(to bottom, #2C5364, #203A43, #0F2027);  /* Chrome 10-25, Safari 5.1-6 */
                    background: linear-gradient(to bottom, #2C5364, #203A43, #0F2027); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
        
                    font-family: Tahoma, Verdana, Segoe, sans-serif;
                }
                
                .main {
                    padding-top:4%;
                }
            `}</style>
        </>
    );
};

export default Layout