export async function getSeriesData() {
    const response = await fetch('a_bout_de_souffle_series_bible.md');
    const text = await response.text();

    const mainCharacters = parseMainCharacters(text);
    const secondaryCharacters = parseTable(text, "### **Personnages Secondaires**");
    const episodes = parseEpisodes(text);

    return { mainCharacters, secondaryCharacters, episodes };
}

function parseMainCharacters(text) {
    const characterImages = {
        "LUCA SAN LORENZO (22 ANS)": "https://r2.flowith.net/files/o/1752949669247-luca_character_portrait_photorealistic_cinematic_dark_index_1@1024x1024.png",
        "PRIMO HASSAN (24 ANS)": "https://r2.flowith.net/files/o/1752949672310-primo_character_portrait_photorealistic_cinematic_index_2@1024x1024.png",
        "SHAINEZ CHALAL (26 ANS)": "https://r2.flowith.net/files/o/1752949684741-shainez_character_portrait_index_3@1024x1024.png"
    };

    const characterRegex = new RegExp('#### \\\\*\\\\*(.*?)\\\\*\\\\*\\\\s+> \\\\*\"(.*?)\"\\\\*\\\\s+-\\\\s+\\\\*\\\\*Psychologie :\\\\*\\\\* (.*?)\\\\s+-\\\\s+\\\\*\\\\*Motivations :\\\\*\\\\* (.*?)\\\\s+-\\\\s+\\\\*\\\\*Peurs :\\\\*\\\\* (.*?)\\\\s+-\\\\s+\\\\*\\\\*Arc Narratif \\\\(Saison 1\\\\) :\\\\*\\\\* (.*?)\\\\n', 'gs');
    
    let matches;
    const characters = [];
    while ((matches = characterRegex.exec(text)) !== null) {
        const name = matches[1].trim();
        characters.push({
            name: name,
            quote: matches[2].trim(),
            psychology: matches[3].trim(),
            motivations: matches[4].trim(),
            fears: matches[5].trim(),
            arc: matches[6].trim(),
            imageSrc: characterImages[name] || ''
        });
    }
    return characters;
}

function parseTable(text, header) {
    const sectionRegex = new RegExp(header.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '\\\\s*\\\\| (.*?)\\\\s*\\\\|\\\\s*(.*?)\\\\s*\\\\|\\\\s*(.*?)\\\\s*\\\\|([\\\\s\\\\S]*?)(?=\\\\n---|\\\\n##)');
    const match = text.match(sectionRegex);

    if (!match) return { headers: [], rows: [] };

    const headers = [match[1], match[2], match[3]].concat(match[4].trim().split('|').slice(0, -1)).map(h => h.trim()).filter(h => h && h !== ':---');

    const rowsContent = text.substring(match.index + match[0].indexOf('\\n', match[0].indexOf(':---')) + 1);
    const rowsText = rowsContent.split('---')[0];
    
    const rows = rowsText.split('\\n')
        .map(row => row.trim())
        .filter(row => row && row.startsWith('|'))
        .map(row => {
            return row.split('|').slice(1, -1).map(cell => cell.trim());
        });

    return { headers, rows };
}


function parseEpisodes(text) {
    const episodeRegex = new RegExp('### **Épisode (\\\\d+) : \"(.*?)\"**\\\\s+**Logline :** (.*?)\\\\s+**Synopsis :** ([\\\\s\\\\S]*?)(?=\\\\n###|\\\\n---)', 'g');
    
    let matches;
    const episodes = [];
    while ((matches = episodeRegex.exec(text)) !== null) {
        episodes.push({
            number: matches[1].trim(),
            title: matches[2].trim(),
            logline: matches[3].trim(),
            synopsis: matches[4].trim().replace(/\\n/g, ' ')
        });
    }
    return episodes;
}
