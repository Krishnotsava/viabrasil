document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // 1. SHRINKING HEADER ON SCROLL
    // ==========================================================================
    const header = document.querySelector('.header-nav');
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Run once on load

    // ==========================================================================
    // 1.2 PARALLAX FLOATING ITEMS SCROLL EFFECT
    // ==========================================================================
    const parallaxItems = document.querySelectorAll('.parallax-floating-item');
    
    if (parallaxItems.length > 0) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            requestAnimationFrame(() => {
                parallaxItems.forEach(item => {
                    const speed = parseFloat(item.getAttribute('data-speed')) || 0.1;
                    const rotateSpeed = parseFloat(item.getAttribute('data-rotate')) || 0.05;
                    item.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * rotateSpeed}deg)`;
                });
            });
        });
    }

    // ==========================================================================
    // 2. MOBILE MENU TOGGLE
    // ==========================================================================
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Toggle hamburger icon animation
            const spans = mobileToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Close menu when clicking a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const spans = mobileToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }

    // ==========================================================================
    // 3. LANGUAGE SWITCHER
    // ==========================================================================
    const langBtns = document.querySelectorAll('.lang-btn');
    
    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedLang = e.currentTarget.getAttribute('data-lang');
            if (selectedLang) {
                switchLanguage(selectedLang);
            }
        });
    });

    function switchLanguage(lang) {
        try {
            localStorage.setItem('via_brasil_lang', lang);
        } catch (e) {
            console.warn('localStorage is blocked:', e);
        }
        const currentPath = window.location.pathname;
        const langPattern = /\/(pt|es|en)\//;
        
        if (langPattern.test(currentPath)) {
            const newPath = currentPath.replace(langPattern, `/${lang}/`);
            if (window.location.protocol === 'file:') {
                window.location.pathname = newPath;
            } else {
                window.location.href = window.location.origin + newPath + window.location.search;
            }
        } else {
            // Default to subfolder redirect
            window.location.href = `../${lang}/index.html`;
        }
    }

    // Mark active language button on load based on current path
    const currentPath = window.location.pathname;
    let currentLang = 'pt'; // default fallback
    if (currentPath.includes('/es/')) {
        currentLang = 'es';
    } else if (currentPath.includes('/en/')) {
        currentLang = 'en';
    }
    
    langBtns.forEach(btn => {
        if (btn.getAttribute('data-lang') === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // ==========================================================================
    // 4. ACTIVE LINK ON SCROLL (INTERSECTION OBSERVER)
    // ==========================================================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (sections.length > 0 && navLinks.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px', // Trigger when section occupies the middle of viewport
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        if (link.getAttribute('href').endsWith(`#${id}`)) {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            });
        }, observerOptions);
        
        sections.forEach(section => observer.observe(section));
    }

    // ==========================================================================
    // 5. MODAL SYSTEM (<dialog>)
    // ==========================================================================
    const modalTriggers = document.querySelectorAll('[data-open-modal]');
    const modalCloses = document.querySelectorAll('[data-close-modal]');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-open-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.showModal();
                document.body.style.overflow = 'hidden'; // Lock background scroll
            }
        });
    });
    
    modalCloses.forEach(close => {
        close.addEventListener('click', () => {
            const modal = close.closest('dialog');
            if (modal) {
                modal.close();
                document.body.style.overflow = ''; // Unlock scroll
            }
        });
    });
    
    // Close modal when clicking backdrop
    const dialogs = document.querySelectorAll('dialog');
    dialogs.forEach(dialog => {
        dialog.addEventListener('click', (e) => {
            const rect = dialog.getBoundingClientRect();
            const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
                                rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
            if (!isInDialog) {
                dialog.close();
                document.body.style.overflow = '';
            }
        });
    });

    // ==========================================================================
    // 6. BRAND FILTERS & SEARCH (brands.html)
    // ==========================================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const brandCards = document.querySelectorAll('.brand-detail-card');
    
    if (filterButtons.length > 0 && brandCards.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Set active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const filterValue = button.getAttribute('data-filter');
                
                brandCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    if (filterValue === 'all' || cardCategory === filterValue) {
                        card.style.display = 'flex';
                        // Add fade animation
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transition = 'opacity 0.4s ease';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // ==========================================================================
    // 7. B2B FORM VALIDATION & SIMULATION
    // ==========================================================================
    const contactForm = document.getElementById('b2b-contact-form');
    const newsletterForm = document.getElementById('newsletter-form');
    const preRegForm = document.getElementById('prereg-form');
    
    // Custom Success Modal helper
    const showNotification = (title, message) => {
        const dialog = document.createElement('dialog');
        dialog.className = 'custom-modal';
        dialog.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" aria-label="Fechar">&times;</button>
            </div>
            <div class="modal-body" style="text-align: center; padding: 40px 32px;">
                <p style="font-size: 16px; margin-bottom: 24px;">${message}</p>
                <button class="btn btn-primary" onclick="this.closest('dialog').close()">${currentLang === 'pt' ? 'Fechar' : (currentLang === 'es' ? 'Cerrar' : 'Close')}</button>
            </div>
        `;
        document.body.appendChild(dialog);
        dialog.showModal();
        dialog.querySelector('.modal-close').addEventListener('click', () => dialog.close());
        dialog.addEventListener('close', () => {
            dialog.remove();
            document.body.style.overflow = '';
        });
    };

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic fields validation
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const company = document.getElementById('contact-company').value.trim();
            const msg = document.getElementById('contact-message').value.trim();
            
            if (!name || !email || !msg) {
                const errTitle = currentLang === 'pt' ? 'Erro' : (currentLang === 'es' ? 'Error' : 'Error');
                const errMsg = currentLang === 'pt' ? 'Por favor, preencha todos os campos obrigatórios (*).' : (currentLang === 'es' ? 'Por favor, complete todos los campos obligatorios (*).' : 'Please fill in all required fields (*).');
                showNotification(errTitle, errMsg);
                return;
            }
            
            // Simulate B2B success submission
            const successTitle = currentLang === 'pt' ? 'Contato Recebido' : (currentLang === 'es' ? 'Contacto Recibido' : 'Message Sent');
            const successMsg = currentLang === 'pt' 
                ? `Obrigado, ${name}! Recebemos a solicitação da empresa <strong>${company || 'Não especificada'}</strong>. Nosso departamento de distribuição B2B retornará em breve no e-mail: ${email}.`
                : (currentLang === 'es' 
                    ? `¡Gracias, ${name}! Hemos recibido la solicitud de la empresa <strong>${company || 'No especificada'}</strong>. Nos comunicaremos con usted a la brevedad al correo: ${email}.`
                    : `Thank you, ${name}! We have received the inquiry from <strong>${company || 'Not specified'}</strong>. Our B2B distribution team will respond shortly to: ${email}.`);
            
            showNotification(successTitle, successMsg);
            contactForm.reset();
        });
    }
    
    if (preRegForm) {
        preRegForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = preRegForm.querySelector('input[type="email"]').value.trim();
            const name = preRegForm.querySelector('input[type="text"]').value.trim();
            
            if (!email || !name) return;
            
            const successTitle = currentLang === 'pt' ? 'Cadastro Confirmado' : (currentLang === 'es' ? 'Registro Confirmado' : 'Registration Confirmed');
            const successMsg = currentLang === 'pt' 
                ? `Parabéns, ${name}! Seu e-mail (${email}) foi cadastrado com sucesso. Você receberá atualizações exclusivas sobre o lançamento do nosso E-commerce B2B (2025/2026).`
                : (currentLang === 'es' 
                    ? `¡Felicitaciones, ${name}! Su correo (${email}) ha sido registrado con éxito. Recibirá novedades exclusivas sobre el lanzamiento de nuestro E-commerce B2B (2025/2026).`
                    : `Congratulations, ${name}! Your email (${email}) has been registered. You will receive exclusive updates about our upcoming B2B E-commerce platform (2025/2026).`);
                    
            showNotification(successTitle, successMsg);
            preRegForm.reset();
        });
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');
            if (emailInput && emailInput.value.trim()) {
                const successTitle = currentLang === 'pt' ? 'Newsletter' : (currentLang === 'es' ? 'Newsletter' : 'Newsletter');
                const successMsg = currentLang === 'pt' 
                    ? 'Inscrição realizada com sucesso! Você passará a receber nossas novidades e eventos.'
                    : (currentLang === 'es' 
                        ? '¡Suscripción realizada con éxito! Recibirá nuestras noticias y eventos.'
                        : 'Subscription successful! You will now receive our corporate updates and events.');
                        
                showNotification(successTitle, successMsg);
                newsletterForm.reset();
            }
        });
    }

    // ==========================================================================
    // 7. HERO CANVAS IMAGE SEQUENCE SCROLL ANIMATION
    // ==========================================================================
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
        const ctx = heroCanvas.getContext('2d');
        const frameCount = 192;
        
        // Path helper
        const currentFrame = index => `../assets/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;
        
        // Preload first frame
        const firstFrameImg = new Image();
        firstFrameImg.src = currentFrame(1);
        firstFrameImg.onload = () => {
            heroCanvas.width = firstFrameImg.naturalWidth;
            heroCanvas.height = firstFrameImg.naturalHeight;
            ctx.drawImage(firstFrameImg, 0, 0);
        };
        
        // Preload array
        const images = [];
        let loadedCount = 0;
        
        // Load all frames
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.src = currentFrame(i);
            img.onload = () => {
                loadedCount++;
            };
            images.push(img);
        }
        
        const renderFrame = index => {
            const image = images[index - 1];
            if (image && image.complete) {
                ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
                ctx.drawImage(image, 0, 0);
            }
        };
        
        // Update frame index based on page scroll
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const maxScroll = window.innerHeight;
            const scrollFraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
            
            const frameIndex = Math.min(
                frameCount,
                Math.ceil(scrollFraction * frameCount) || 1
            );
            
            requestAnimationFrame(() => renderFrame(frameIndex));
        });
    }

    // ==========================================================================
    // 8. STATS COUNTER ANIMATION (Intersection Observer)
    // ==========================================================================
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        const animateCount = (el) => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 2000; // 2 seconds
            const startTime = performance.now();
            
            const updateCount = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease out cubic
                const easeProgress = 1 - Math.pow(1 - progress, 3); 
                const currentVal = Math.floor(easeProgress * target);
                
                el.textContent = currentVal + suffix;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    el.textContent = target + suffix;
                }
            };
            
            requestAnimationFrame(updateCount);
        };
        
        const observerOptions = {
            threshold: 0.2
        };
        
        const statsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const numberEl = entry.target.querySelector('.stat-number');
                    if (numberEl && !numberEl.classList.contains('animated')) {
                        numberEl.classList.add('animated');
                        animateCount(numberEl);
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.stat-card').forEach(card => {
            statsObserver.observe(card);
        });
    }

    // ==========================================================================
    // 9. OLFACTORY MATCHER QUIZ LOGIC
    // ==========================================================================
    const optionBtns = document.querySelectorAll('.option-btn');
    const matcherResults = document.getElementById('matcher-results');
    const resultsGrid = document.getElementById('results-grid');
    
    const perfumeData = {
        pt: {
            woody: [
                { brand: 'Amouage', name: 'Interlude Man', notes: 'Oud, Couro, Incenso, Âmbar, Patchouli e Sândalo.' },
                { brand: 'Creed', name: 'Aventus', notes: 'Musgo de Carvalho, Âmbar Cinzento, Bétula e Cedro.' },
                { brand: 'Tom Ford', name: 'Oud Wood', notes: 'Madeira de Oud, Jacarandá, Cardamomo, Sândalo e Vetiver.' }
            ],
            citrus: [
                { brand: 'Acqua di Parma', name: 'Colonia', notes: 'Limão Siciliano, Bergamota da Calábria, Alecrim e Lavanda.' },
                { brand: 'Creed', name: 'Silver Mountain Water', notes: 'Chá Verde, Groselha Preta, Mandarina, Almíscar e Gálbano.' },
                { brand: 'Hermès', name: 'Terre d\'Hermès', notes: 'Laranja, Toranja, Sílex, Vetiver, Cedro e Patchouli.' }
            ],
            floral: [
                { brand: 'Lancôme', name: 'La Vie Est Belle', notes: 'Íris, Jasmim, Flor de Laranjeira, Pera, Groselha Preta e Baunilha.' },
                { brand: 'Jean Paul Gaultier', name: 'Classique', notes: 'Flor de Laranjeira, Gengibre, Íris, Rosa, Baunilha e Âmbar.' },
                { brand: 'Paco Rabanne', name: 'Lady Million', notes: 'Jasmim, Flor de Laranjeira, Gardênia, Framboesa, Mel e Patchouli.' }
            ],
            oriental: [
                { brand: 'Tom Ford', name: 'Black Orchid', notes: 'Trufa Negra, Ylang-Ylang, Incenso, Âmbar, Baunilha, Sândalo e Patchouli.' },
                { brand: 'Amouage', name: 'Reflection Woman', notes: 'Notas Verdes, Frésia, Magnólia, Jasmim, Sândalo, Âmbar e Cedro.' },
                { brand: 'Yves Saint Laurent', name: 'Opium', notes: 'Tangerina, Cravo-da-Índia, Jasmim, Mirra, Baunilha e Âmbar.' }
            ]
        },
        es: {
            woody: [
                { brand: 'Amouage', name: 'Interlude Man', notes: 'Oud, Cuero, Incienso, Ámbar, Pachulí y Sándalo.' },
                { brand: 'Creed', name: 'Aventus', notes: 'Musgo de Roble, Ámbar Gris, Abedul y Cedro.' },
                { brand: 'Tom Ford', name: 'Oud Wood', notes: 'Madera de Oud, Palo de Rosa, Cardamomo, Sándalo y Vetiver.' }
            ],
            citrus: [
                { brand: 'Acqua di Parma', name: 'Colonia', notes: 'Limón Siciliano, Bergamota de Calabria, Romero y Lavanda.' },
                { brand: 'Creed', name: 'Silver Mountain Water', notes: 'Té Verde, Grosella Negra, Mandarina, Almizcle y Gálbano.' },
                { brand: 'Hermès', name: 'Terre d\'Hermès', notes: 'Naranja, Toronja, Sílex, Vetiver, Cedro y Pachulí.' }
            ],
            floral: [
                { brand: 'Lancôme', name: 'La Vie Est Belle', notes: 'Iris, Jazmín, Flor de Azahar, Pera, Grosella Negra y Vainilla.' },
                { brand: 'Jean Paul Gaultier', name: 'Classique', notes: 'Flor de Azahar, Jengibre, Iris, Rosa, Vainilla y Ámbar.' },
                { brand: 'Paco Rabanne', name: 'Lady Million', notes: 'Jazmín, Flor de Azahar, Gardenia, Frambuesa, Miel y Pachulí.' }
            ],
            oriental: [
                { brand: 'Tom Ford', name: 'Black Orchid', notes: 'Trufa Negra, Ylang-Ylang, Incienso, Ámbar, Vainilla, Sándalo y Pachulí.' },
                { brand: 'Amouage', name: 'Reflection Woman', notes: 'Notas Verdes, Fresia, Magnolia, Jazmín, Sándalo, Ámbar y Cedro.' },
                { brand: 'Yves Saint Laurent', name: 'Opium', notes: 'Mandarina, Clavo de Olor, Jazmín, Mirra, Vainilla y Ámbar.' }
            ]
        },
        en: {
            woody: [
                { brand: 'Amouage', name: 'Interlude Man', notes: 'Oud, Leather, Incense, Amber, Patchouli and Sandalwood.' },
                { brand: 'Creed', name: 'Aventus', notes: 'Oakmoss, Ambergris, Birch and Cedarwood.' },
                { brand: 'Tom Ford', name: 'Oud Wood', notes: 'Oud Wood, Rosewood, Cardamom, Sandalwood and Vetiver.' }
            ],
            citrus: [
                { brand: 'Acqua di Parma', name: 'Colonia', notes: 'Sicilian Lemon, Calabrian Bergamot, Rosemary and Lavender.' },
                { brand: 'Creed', name: 'Silver Mountain Water', notes: 'Green Tea, Blackcurrant, Mandarin, Musk and Galbanum.' },
                { brand: 'Hermès', name: 'Terre d\'Hermès', notes: 'Orange, Grapefruit, Flint, Vetiver, Cedar and Patchouli.' }
            ],
            floral: [
                { brand: 'Lancôme', name: 'La Vie Est Belle', notes: 'Iris, Jasmine, Orange Blossom, Pear, Blackcurrant and Vanilla.' },
                { brand: 'Jean Paul Gaultier', name: 'Classique', notes: 'Orange Blossom, Ginger, Iris, Rose, Vanilla and Amber.' },
                { brand: 'Paco Rabanne', name: 'Lady Million', notes: 'Jasmine, Orange Blossom, Gardenia, Raspberry, Honey and Patchouli.' }
            ],
            oriental: [
                { brand: 'Tom Ford', name: 'Black Orchid', notes: 'Black Truffle, Ylang-Ylang, Incense, Amber, Vanilla, Sandalwood and Patchouli.' },
                { brand: 'Amouage', name: 'Reflection Woman', notes: 'Green Notes, Freesia, Magnolia, Jasmine, Sandalwood, Amber and Cedarwood.' },
                { brand: 'Yves Saint Laurent', name: 'Opium', notes: 'Tangerine, Clove, Jasmine, Myrrh, Vanilla and Amber.' }
            ]
        }
    };
    
    if (optionBtns.length > 0 && matcherResults && resultsGrid) {
        optionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                optionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const family = btn.getAttribute('data-family');
                const langData = perfumeData[currentLang] || perfumeData['pt'];
                const matches = langData[family] || [];
                
                resultsGrid.innerHTML = '';
                
                matches.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'result-card';
                    
                    const notesTitle = currentLang === 'pt' ? 'Notas Principais' : (currentLang === 'es' ? 'Notas Principales' : 'Key Notes');
                    
                    card.innerHTML = `
                        <div class="result-brand">${item.brand}</div>
                        <h4 class="result-name">${item.name}</h4>
                        <p class="result-notes"><strong>${notesTitle}:</strong> ${item.notes}</p>
                    `;
                    resultsGrid.appendChild(card);
                });
                
                matcherResults.style.display = 'block';
                setTimeout(() => {
                    matcherResults.classList.add('show');
                }, 50);
            });
        });
    }

    // ==========================================================================
    // 10. STORE LOCATOR TAB FILTER LOGIC
    // ==========================================================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const storeCards = document.querySelectorAll('.store-card');
    
    if (tabBtns.length > 0 && storeCards.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.getAttribute('data-filter');
                
                storeCards.forEach(card => {
                    const city = card.getAttribute('data-city');
                    if (filter === 'all' || city === filter) {
                        card.style.display = 'flex';
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transition = 'opacity 0.4s ease';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
});
