'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

const HorizontalScrollComponent = ({ children }: { children: React.ReactElement }) => {
    const [scrollX, setScrollX] = useState(0); // State to hold the scroll position
    const scrollContainerRef = useRef(null);   // Reference to the scrollable div
    const [maxScrollX, setMaxScrollX] = useState(0);

    // Update scroll position in state whenever the div is scrolled
    const handleScroll = () => {
        const container = scrollContainerRef.current as any
        if (scrollContainerRef.current) {
            setScrollX(container.scrollLeft as number);
        }
    };
    const handleScrollRight = () => {
        const container = scrollContainerRef.current as any
        if (container) {
            container.scrollLeft += 120;
        }
    };
    const handleScrollLeft = () => {
        const container = scrollContainerRef.current as any
        if (container) {
            container.scrollLeft -= 120;
        }
    };
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current as any

        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            setMaxScrollX(scrollContainer.scrollWidth - scrollContainer.clientWidth);
            console.log("scroll", scrollContainer.scrollWidth - scrollContainer.clientWidth)


            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <div className=' relative'>
            <div
                ref={scrollContainerRef}
                style={{
                    overflowX: 'scroll',
                    whiteSpace: 'nowrap',
                }}
                className=' scroll-smooth'
            >
                <div style={{ display: 'inline-block' }}>
                    {scrollX > 100 && <div className=' w-1/6 top-0 left-0 bottom-0 absolute z-40 bg-gradient-to-r from-black to-transparent opacity-70 flex items-center justify-center rounded' onClick={handleScrollLeft}>
                    <ChevronLeft size={50} color='white' className=' -ml-5' />
                    </div>}
                    {children}
                    {scrollX < (maxScrollX - 100) && <div className=' w-1/6 top-0 right-0 bottom-0 absolute z-40  bg-gradient-to-r from-transparent to-black opacity-70 flex items-center justify-center rounded' onClick={handleScrollRight}>
                    <ChevronRight size={50} color='white' className=' -mr-5'/>
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default HorizontalScrollComponent;