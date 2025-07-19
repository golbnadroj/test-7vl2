import * as framerMotion from 'https://esm.run/framer-motion';
import { getSeriesData } from './data_parser.js';

const { animate, scroll } = framerMotion;

document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    setupHeaderScroll();

    try {
        const { mainCharacters, secondaryCharacters, episodes } = await getSeriesData();
        
        populateMainCharacters(mainCharacters);
        populateSecondaryCharacters(secondaryCharacters);
        populateTimeline();
        populateEpisodes(episodes);
        
        setupAnimations();

    } catch (error) {
        console.error("Failed to load or parse series data:", error);

        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = `<div class="container mx-auto px-6 py-40 text-center"><h2 class="text-2xl text-red-500">Erreur de chargement du contenu.</h2><p>Impossible d'afficher les informations de la série.</p></div>`;
        }
    }
});

function setupHeaderScroll() {
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function populateMainCharacters(characters) {
    const container = document.getElementById('main-characters-container');
    if (!container) return;

    characters.forEach((char, index) => {
        const isReversed = index % 2 !== 0;
        const cardHTML = `
            <div class="character-card grid md:grid-cols-5 gap-8 items-center p-6 rounded-lg anim-fade-up">
                <div class="md:col-span-2 ${isReversed ? 'md:order-last' : ''}">
                    <img src="${char.imageSrc}" alt="Portrait de ${char.name}" class="rounded-lg w-full h-full object-cover shadow-lg">
                </div>
                <div class="md:col-span-3">
                    <h3 class="font-heading text-4xl text-white tracking-wider">${char.name}</h3>
                    <p class="text-brand-accent italic my-4">\"${char.quote}\"</p>
                    <div class="space-y-3 text-brand-light/90 text-sm">
                        <p><strong>Psychologie :</strong> ${char.psychology}</p>
                        <p><strong>Motivations :</strong> ${char.motivations}</p>
                        <p><strong>Peurs :</strong> ${char.fears}</p>
                        <p><strong>Arc Narratif (S1) :</strong> ${char.arc}</p>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function createTableHTML(data) {
    if (!data || !data.headers || !data.rows) return '<p>Données non disponibles.</p>';
    
    let tableHTML = '<table class=\"custom-table\">';
    tableHTML += '<thead><tr>';
    data.headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
    });
    tableHTML += '</tr></thead>';

    tableHTML += '<tbody>';
    data.rows.forEach(row => {
        tableHTML += '<tr>';
        row.forEach(cell => {
            tableHTML += `<td>${cell.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')}</td>`;
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    return tableHTML;
}

function populateSecondaryCharacters(data) {
    const container = document.getElementById('secondary-characters-container');
    if (!container) return;
    container.innerHTML = createTableHTML(data);
}

function populateTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const events = [
        { episode: 'Ép. 1', title: 'La Chute', description: 'L\'arrestation de Luca brise ses rêves. Rejeté par le système, il bascule dans le trafic par nécessité.' },
        { episode: 'Ép. 2-3', title: 'Point de Non-Retour', description: 'Un meurtre involontaire force le duo à fuir Paris pour Barcelone, marquant le début de leur véritable descente aux enfers.' },
        { episode: 'Ép. 4-5', title: 'Nouvel Ordre', description: 'L\'arrivée de la stratège Shainez professionnalise l\'empire mais brise la fraternité du duo, menant à une trahison.' },
        { episode: 'Ép. 6', title: 'Révélation', description: 'Luca découvre qu\'il est père. Cette vérité redéfinit toutes ses motivations, le liant plus que jamais à sa vie criminelle.' },
        { episode: 'Ép. 7', title: 'Au Bord du Gouffre', description: 'Tiraillé entre sa famille et son empire, une saisie majeure de marchandise met l\'organisation au bord de la faillite.' },
        { episode: 'Ép. 8', title: 'Quitte ou Double', description: 'Luca retourne à Paris pour une double mission suicide : neutraliser une menace et voler les scellés pour sauver son empire.' }
    ];

    let timelineHTML = '';
    events.forEach((event, index) => {
        const side = index % 2 === 0 ? 'left' : 'right';
        timelineHTML += `
            <div class="timeline-item-wrapper">
                <div class="timeline-item ${side}">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">${event.episode}</div>
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = timelineHTML;
}

function populateEpisodes(episodes) {
    const container = document.getElementById('episodes-container');
    if (!container) return;
    
    let episodesHTML = '';
    episodes.forEach(ep => {
        episodesHTML += `
            <div class="episode-item rounded-lg anim-fade-up">
                <div class="episode-header">
                    <h4><span>Épisode ${ep.number}</span>${ep.title}</h4>
                    <i data-lucide="chevron-down" class="icon-toggle text-brand-accent"></i>
                </div>
                <div class="episode-content">
                    <div class="py-4">
                        <p class="logline">${ep.logline}</p>
                        <p class="text-brand-light/80 text-sm">${ep.synopsis}</p>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = episodesHTML;
    
    lucide.createIcons();


    container.querySelectorAll('.episode-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            
            item.classList.toggle('open');

            if (item.classList.contains('open')) {
                content.style.maxHeight = content.scrollHeight + 'px';
                content.style.paddingTop = '1rem';
                content.style.paddingBottom = '1rem';
            } else {
                content.style.maxHeight = '0';
                content.style.paddingTop = '0';
                content.style.paddingBottom = '0';
            }
        });
    });
}


function setupAnimations() {
    const heroBg = document.getElementById('hero-bg');
    if(heroBg) {
        scroll(
            (progress) => {
                const y = progress * 200;
                heroBg.style.transform = `translateY(${y}px)`;
            }
        );
    }
    
    document.querySelectorAll('.anim-fade-up').forEach(element => {
        scroll(
            animate(element, { opacity: [0, 1], y: [30, 0] }),
            {
                target: element,
                offset: ["start end", "end end"],
            }
        );
    });

    document.querySelectorAll('.timeline-item').forEach(element => {
        scroll(
            animate(element, { opacity: [0, 1], x: element.classList.contains('left') ? [-50, 0] : [50, 0] }),
            {
                target: element,
                offset: ["start end", "end center"],
            }
        )
    });
}
