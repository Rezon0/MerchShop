import React from 'react';

const Footer = () => (
    <footer className="bg-gray-800 text-white p-4 mt-8 shadow-inner rounded-t-lg">
        <div className="container mx-auto text-center text-sm">
            &copy; {new Date().getFullYear()} Merch Shop. Все права защищены.
        </div>
    </footer>
);

export default Footer;