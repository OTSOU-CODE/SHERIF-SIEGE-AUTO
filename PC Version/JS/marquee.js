/**
 * Creates a Marquee component.
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.target - The element to append the marquee to (or replace if desired, though append is standard).
 * @param {Array<string>} options.items - Array of HTML strings for the marquee items.
 * @param {number} [options.speed=30] - Speed in seconds for one full loop.
 * @param {string} [options.direction='left'] - 'left' or 'right'.
 * @param {boolean} [options.pauseOnHover=false] - Whether to pause on hover.
 * @param {string} [options.className=''] - Additional class names for the root container.
 */
export function createMarquee({
    target,
    items = [],
    speed = 30,
    direction = 'left',
    pauseOnHover = false,
    className = ''
} = {}) {
    // 1. Create the root container
    const root = document.createElement('div');
    root.className = `marquee-root ${className} ${pauseOnHover ? 'pause-on-hover' : ''}`;
    
    // 2. Create the track
    const track = document.createElement('div');
    track.className = 'marquee-track';
    
    // Set custom properties for animation
    track.style.setProperty('--marquee-duration', `${speed}s`);
    if (direction === 'right') {
        track.classList.add('animate-marquee-reverse');
    }

    // 3. Populate items
    // We render the items twice to create the seamless loop effect
    // translateX(-50%) moves the track by half its width (one full set of items)
    // so when it resets to 0, it looks identical.
    
    const renderItems = () => {
        return items.map(itemHtml => {
           const itemDiv = document.createElement('div');
           itemDiv.className = 'marquee-item';
           itemDiv.innerHTML = itemHtml;
           return itemDiv;
        });
    }

    // Append first set
    renderItems().forEach(node => track.appendChild(node));
    // Append duplicate set
    renderItems().forEach(node => track.appendChild(node));

    // 4. Assemble
    root.appendChild(track);
    
    // 5. Append to target
    if (target) {
        target.appendChild(root);
    }
    
    return root;
}
