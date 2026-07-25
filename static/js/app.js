// JavaScript logic for DevOps Webinar Landing Page

document.addEventListener('DOMContentLoaded', () => {
    // 1. Live Countdown Timer
    // Target: Saturday, July 25, 2026 at 19:00 GMT+1 (Rabat time)
    // 19:00 GMT+1 = 18:00 UTC. In JS, July is month index 6 (0-indexed).
    const targetDate = new Date(Date.UTC(2026, 6, 25, 18, 0, 0));
    
    const dBox = document.getElementById('days');
    const hBox = document.getElementById('hours');
    const mBox = document.getElementById('minutes');
    const sBox = document.getElementById('seconds');
    const countdownBoxes = document.querySelector('.countdown-digits');
    const startedMessage = document.querySelector('.event-started-message');
    const countdownTitle = document.querySelector('.countdown-title');
    
    function updateCountdown() {
        const now = new Date();
        const difference = targetDate - now;
        
        if (difference <= 0) {
            // Event has started
            if (countdownBoxes) countdownBoxes.style.display = 'none';
            if (startedMessage) startedMessage.style.display = 'block';
            if (countdownTitle) countdownTitle.innerText = "Statut de l'événement";
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        if (dBox) dBox.innerText = String(days).padStart(2, '0');
        if (hBox) hBox.innerText = String(hours).padStart(2, '0');
        if (mBox) mBox.innerText = String(minutes).padStart(2, '0');
        if (sBox) sBox.innerText = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // 2. Interactive Pipeline Curriculum (Accordion)
    const pipelineNodes = document.querySelectorAll('.pipeline-node');
    pipelineNodes.forEach(node => {
        node.addEventListener('click', () => {
            // Remove active class from other nodes
            pipelineNodes.forEach(n => {
                if (n !== node) n.classList.remove('active');
            });
            // Toggle active class on clicked node
            node.classList.toggle('active');
        });
    });
    
    // 3. AJAX Registration Submission
    const registerForm = document.getElementById('register-form');
    const btnSubmit = document.getElementById('btn-submit');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');
    const formAlert = document.getElementById('form-alert');
    
    const successModalOverlay = document.getElementById('success-modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const registrantNameSpan = document.getElementById('registrant-name');
    const liveCountBadge = document.getElementById('live-count');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Clear previous alerts
            formAlert.style.display = 'none';
            formAlert.className = 'form-alert';
            
            const full_name = document.getElementById('full_name').value.trim();
            const email = document.getElementById('email').value.trim();
            const role = document.getElementById('role').value;
            
            // Basic Frontend Validation
            if (!full_name || !email || !role) {
                showFormAlert('error', 'Veuillez remplir tous les champs obligatoires.');
                return;
            }
            
            // Get CSRF Token
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            
            // Disable button & show spinner
            btnSubmit.disabled = true;
            submitText.innerText = "Inscription en cours...";
            submitSpinner.style.display = 'inline-block';
            
            try {
                const response = await fetch('/api/register/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({ full_name, email, role })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Success!
                    registrantNameSpan.innerText = full_name;
                    if (liveCountBadge) {
                        liveCountBadge.innerText = data.count;
                        liveCountBadge.classList.add('highlight');
                    }
                    
                    // Show success alert in form
                    showFormAlert('success', data.message);
                    
                    // Clear form
                    registerForm.reset();
                    
                    // Open overlay modal
                    setTimeout(() => {
                        successModalOverlay.classList.add('active');
                    }, 800);
                } else {
                    // Server validation error
                    showFormAlert('error', data.error || "Une erreur est survenue.");
                }
            } catch (err) {
                showFormAlert('error', "Impossible de se connecter au serveur. Veuillez réessayer.");
            } finally {
                // Re-enable button
                btnSubmit.disabled = false;
                submitText.innerText = "S'inscrire Gratuitement";
                submitSpinner.style.display = 'none';
            }
        });
    }
    
    function showFormAlert(type, message) {
        formAlert.innerText = message;
        formAlert.style.display = 'block';
        if (type === 'error') {
            formAlert.classList.add('form-alert-error');
        } else {
            formAlert.classList.add('form-alert-success');
        }
    }
    
    // Modal Close
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            successModalOverlay.classList.remove('active');
        });
    }
    if (successModalOverlay) {
        successModalOverlay.addEventListener('click', (e) => {
            if (e.target === successModalOverlay) {
                successModalOverlay.classList.remove('active');
            }
        });
    }
    
    // 4. Comments & Participation Confirmation
    const commentForm = document.getElementById('comment-form');
    const commentInputName = document.getElementById('comment-input-name');
    const commentInputRole = document.getElementById('comment-input-role');
    const commentTextarea = document.getElementById('comment-textarea');
    const commentsFeed = document.getElementById('comments-feed');
    
    // Load local comments
    let localComments = JSON.parse(localStorage.getItem('webinar_comments')) || [];
    
    function renderComments() {
        if (!commentsFeed) return;
        
        // Retrieve default comments injected or fallback list
        const defaultCommentsHtml = Array.from(commentsFeed.querySelectorAll('.comment-item[data-default="true"]'));
        
        // Clear all except defaults
        commentsFeed.innerHTML = '';
        
        // Render local storage comments first (newest first)
        localComments.forEach(comment => {
            const commentElement = createCommentNode(comment.name, comment.role, comment.text, comment.time, false);
            commentsFeed.appendChild(commentElement);
        });
        
        // Re-append default comments
        defaultCommentsHtml.forEach(node => {
            commentsFeed.appendChild(node);
        });
    }
    
    function createCommentNode(name, role, text, time, isDefault) {
        const item = document.createElement('div');
        item.className = 'comment-item';
        if (isDefault) item.setAttribute('data-default', 'true');
        
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        item.innerHTML = `
            <div class="comment-item-avatar">${initials}</div>
            <div class="comment-item-content">
                <div class="comment-item-header">
                    <div>
                        <span class="comment-item-name">${name}</span>
                        <span class="comment-item-role"> • ${role}</span>
                    </div>
                    <span class="comment-item-time">${time}</span>
                </div>
                <p class="comment-item-text">${text}</p>
            </div>
        `;
        return item;
    }
    
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = commentInputName.value.trim();
            const role = commentInputRole.value.trim() || 'Participant';
            const text = commentTextarea.value.trim();
            
            if (!name || !text) {
                alert('Veuillez renseigner votre nom et votre commentaire.');
                return;
            }
            
            const newComment = {
                name,
                role,
                text,
                time: "À l'instant"
            };
            
            // Add to front of array
            localComments.unshift(newComment);
            localStorage.setItem('webinar_comments', JSON.stringify(localComments));
            
            // Clear fields except name and role for easy continuous comments
            commentTextarea.value = 'Interested';
            
            renderComments();
        });
    }
    
    // Initialize comment section
    renderComments();
    
    // 5. Copier-coller share text generator
    const btnCopyShare = document.getElementById('btn-copy-share');
    const sharePreview = document.getElementById('share-preview');
    
    if (btnCopyShare && sharePreview) {
        btnCopyShare.addEventListener('click', () => {
            const textToCopy = sharePreview.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = btnCopyShare.innerHTML;
                btnCopyShare.innerHTML = '<i class="lucide-check"></i> Copié dans le presse-papiers !';
                btnCopyShare.style.backgroundColor = 'var(--neon-cyan)';
                btnCopyShare.style.color = 'var(--bg-darker)';
                btnCopyShare.style.borderColor = 'transparent';
                
                setTimeout(() => {
                    btnCopyShare.innerHTML = originalText;
                    btnCopyShare.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
                    btnCopyShare.style.color = 'var(--neon-purple)';
                    btnCopyShare.style.borderColor = 'var(--border-purple-glow)';
                }, 2000);
            }).catch(err => {
                alert("Erreur lors de la copie du texte.");
            });
        });
    }
    
    // Social share redirect triggers
    const btnShareLinkedin = document.getElementById('btn-share-linkedin');
    const btnShareWhatsapp = document.getElementById('btn-share-whatsapp');
    
    const shareUrl = "https://lnkd.in/d-rSNjM5";
    const shareText = "Rejoignez-moi au webinaire gratuit DevOps de l'IT Tech Académie animé par Dr. Othman Bakkali Yedri le Samedi 25 Juillet 2026 à 19h00 ! Inscription ici : " + shareUrl;
    
    if (btnShareLinkedin) {
        btnShareLinkedin.addEventListener('click', () => {
            const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
            window.open(linkedinUrl, '_blank', 'width=600,height=500');
        });
    }
    
    if (btnShareWhatsapp) {
        btnShareWhatsapp.addEventListener('click', () => {
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    // 6. Practical Workshop Tab & Flowchart Interactivity
    const navItems = document.querySelectorAll('.workshop-nav-item');
    const tabContents = document.querySelectorAll('.workshop-tab-content');
    const flowchartNodes = document.querySelectorAll('.flowchart-node-card');
    
    function activateStep(stepId) {
        // Deactivate all navigation items & content tabs
        navItems.forEach(item => item.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));
        flowchartNodes.forEach(node => node.classList.remove('active'));
        
        // Activate matching nav item
        const activeNavItem = document.querySelector(`.workshop-nav-item[data-step-target="${stepId}"]`);
        if (activeNavItem) activeNavItem.classList.add('active');
        
        // Activate matching content tab
        const activeTab = document.getElementById(`step-${stepId}`);
        if (activeTab) activeTab.classList.add('active');
        
        // Highlight corresponding flowchart node if applicable
        const activeNode = document.querySelector(`.flowchart-node-card[data-step-nav="${stepId}"]`);
        if (activeNode) {
            activeNode.classList.add('active');
        } else if (stepId === '9') {
            // Let's Encrypt SSL maps to same flowchart block as Nginx (Node 8)
            const sslNode = document.querySelector('.flowchart-node-card[data-step-nav="8"]');
            if (sslNode) sslNode.classList.add('active');
        } else if (stepId === 'intro') {
            const devNode = document.querySelector('.flowchart-node-card[data-step-nav="intro"]');
            if (devNode) devNode.classList.add('active');
        }
    }
    
    // Add click listeners to sidebar nav items
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const stepId = item.getAttribute('data-step-target');
            activateStep(stepId);
        });
    });
    
    // Add click listeners to flowchart nodes to jump to their guide steps
    flowchartNodes.forEach(node => {
        node.addEventListener('click', () => {
            const stepId = node.getAttribute('data-step-nav');
            activateStep(stepId);
            
            // Smooth scroll to the tab container for better readability
            const tabsContainer = document.querySelector('.workshop-tabs-container');
            if (tabsContainer) {
                tabsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
    
    // 7. Clipboard Copy Handler for Workshop Code Snippets
    const copyCodeButtons = document.querySelectorAll('.btn-copy-code');
    copyCodeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-code-target');
            const targetPre = document.getElementById(targetId);
            
            if (targetPre) {
                navigator.clipboard.writeText(targetPre.innerText).then(() => {
                    const originalHtml = btn.innerHTML;
                    btn.innerHTML = '✓ Copié !';
                    btn.style.color = '#10b981';
                    
                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                        btn.style.color = '';
                    }, 2000);
                }).catch(err => {
                    console.error("Failed to copy code snippet: ", err);
                });
            }
        });
    });

    // 8. Theoretical Course Tab Interactivity
    const courseNavItems = document.querySelectorAll('.course-nav-item');
    const courseTabContents = document.querySelectorAll('.course-tab-content');
    
    courseNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-course-target');
            
            // Deactivate all nav items & tab contents
            courseNavItems.forEach(i => i.classList.remove('active'));
            courseTabContents.forEach(t => t.classList.remove('active'));
            
            // Activate current nav item & corresponding tab content
            item.classList.add('active');
            const activeTab = document.getElementById(`course-${targetId}`);
            if (activeTab) activeTab.classList.add('active');
        });
    });
});
