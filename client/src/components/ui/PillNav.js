import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import './PillNav.css';

const PillNav = ({
    logo,
    logoAlt = 'Logo',
    items,
    activeHref,
    className = '',
    ease = 'power3.easeOut',
    baseColor = '#fff',
    pillColor = '#060010',
    hoveredPillTextColor = '#060010',
    pillTextColor,
    onMobileMenuClick,
    initialLoadAnimation = true
}) => {
    const resolvedPillTextColor = pillTextColor ?? baseColor;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const logoImgRef = useRef(null);
    const logoRef = useRef(null);
    const navItemsRef = useRef(null);

    useEffect(() => {
        if (initialLoadAnimation) {
            const logo = logoRef.current;
            const navItems = navItemsRef.current;

            if (logo) {
                gsap.set(logo, { scale: 0 });
                gsap.to(logo, {
                    scale: 1,
                    duration: 0.6,
                    ease
                });
            }

            if (navItems) {
                gsap.set(navItems, { width: 0, overflow: 'hidden' });
                gsap.to(navItems, {
                    width: 'auto',
                    duration: 0.6,
                    ease
                });
            }
        }
    }, [items, ease, initialLoadAnimation]);

    const handleLogoEnter = () => {
        const img = logoImgRef.current;
        if (!img) return;
        gsap.to(img, {
            rotate: 360,
            duration: 0.6,
            ease
        });
    };

    const isExternalLink = href =>
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#');

    const isRouterLink = href => href && !isExternalLink(href);

    const cssVars = {
        ['--base']: baseColor,
        ['--pill-bg']: pillColor,
        ['--hover-text']: hoveredPillTextColor,
        ['--pill-text']: resolvedPillTextColor
    };

    return (
        <div className="pill-nav-container">
            <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
                {isRouterLink(items?.[0]?.href) ? (
                    <Link
                        className="pill-logo"
                        to={items[0].href}
                        aria-label="Home"
                        onMouseEnter={handleLogoEnter}
                        role="menuitem"
                        ref={logoRef}
                    >
                        <img src={logo} alt={logoAlt} ref={logoImgRef} />
                    </Link>
                ) : (
                    <a
                        className="pill-logo"
                        href={items?.[0]?.href || '#'}
                        aria-label="Home"
                        onMouseEnter={handleLogoEnter}
                        ref={logoRef}
                    >
                        <img src={logo} alt={logoAlt} ref={logoImgRef} />
                    </a>
                )}

                <div className="pill-nav-items desktop-only" ref={navItemsRef}>
                    <ul className="pill-list" role="menubar">
                        {items && items.length > 0 && (
                            <div className="pill-nav-items desktop-only" ref={navItemsRef}>
                                <ul className="pill-list" role="menubar">
                                    {items.map((item, i) => (
                                        <li key={item.href || `item-${i}`} role="none">
                                            {isRouterLink(item.href) ? (
                                                <Link
                                                    role="menuitem"
                                                    to={item.href}
                                                    className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                                                    aria-label={item.ariaLabel || item.label}
                                                >
                                                    <span className="pill-label">{item.label}</span>
                                                </Link>
                                            ) : (
                                                <a
                                                    role="menuitem"
                                                    href={item.href}
                                                    className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                                                    aria-label={item.ariaLabel || item.label}
                                                >
                                                    <span className="pill-label">{item.label}</span>
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </ul>
                </div>
            </nav>
        </div>
    );
};

export default PillNav;
