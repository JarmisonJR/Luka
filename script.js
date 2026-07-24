// --- CONFIGURAÇÃO INICIAL E LOCALSTORAGE ---
const DATA_INICIO_NAMORO = new Date("2023-01-01T00:00:00"); 

const STORAGE_KEYS = {
    MOEDAS: 'casal_moedas',
    MURAL: 'casal_mural',
    MISSOES: 'casal_missoes',
    CUPONS: 'casal_cupons',
    ULTIMA_DATA_MISSOES: 'casal_ultima_data_missoes'
};

const missoesBase = [
    { id: 1, titulo: "Assistir um filme juntos", recompensa: 50 },
    { id: 2, titulo: "Cozinhar uma receita nova", recompensa: 100 },
    { id: 3, titulo: "Fazer um passeio ao ar livre", recompensa: 80 },
    { id: 4, titulo: "Escrever uma mensagem carinhosa", recompensa: 60 }
];

const itensLoja = [
    { id: 1, titulo: "Vale Massagem Caprichada 💆", preco: 150 },
    { id: 2, titulo: "Escolher o Filme do Fim de Semana 🎬", preco: 80 },
    { id: 3, titulo: "Noite do Lanche Pago pelo Par 🍔", preco: 250 },
    { id: 4, titulo: "Direito a 1 Pedido Sem Reclamações 👑", preco: 200 }
];

const atividadesRoleta = [
    "Assistir uma série animada 🍿",
    "Pedir uma pizza 🍕",
    "Jogar um jogo de tabuleiro ou videogame 🎮",
    "Fazer brigadeiro juntos 🍫",
    "Dar um passeio noturno 🌙",
    "Fazer uma sessão de fotos engraçadas 📸",
    "Planejar a próxima viagem ✈️"
];

// --- INICIALIZAÇÃO DO APP ---
document.addEventListener('DOMContentLoaded', () => {
    iniciarContador();
    carregarMoedas();
    carregarMural();
    verificarEAtualizarMissoesDiarias();
    carregarLoja();
    carregarCupons();
});

// --- NAVEGAÇÃO ---
function mudarTela(idTela, btnElement) {
    document.querySelectorAll('.app-screen').forEach(screen => screen.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(idTela).classList.add('active');
    if (btnElement) btnElement.classList.add('active');
}

// --- CONTADOR DE TEMPO ---
function iniciarContador() {
    function atualizar() {
        const agora = new Date();
        const diff = agora - DATA_INICIO_NAMORO;

        const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutos = Math.floor((diff / 1000 / 60) % 60);
        const segundos = Math.floor((diff / 1000) % 60);

        document.getElementById('counter').innerText = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
    }
    atualizar();
    setInterval(atualizar, 1000);
}

// --- MOEDAS ---
function carregarMoedas() {
    const moedas = localStorage.getItem(STORAGE_KEYS.MOEDAS) || 0;
    document.getElementById('moedas-count').innerText = moedas;
}

function alterarMoedas(qtd) {
    let moedas = parseInt(localStorage.getItem(STORAGE_KEYS.MOEDAS) || 0);
    moedas += qtd;
    localStorage.setItem(STORAGE_KEYS.MOEDAS, moedas);
    document.getElementById('moedas-count').innerText = moedas;
}

// --- MURAL COM UPLOAD DE MIDIA (BASE64) ---
function abrirModalGerenciarMural() {
    document.getElementById('modal-mural').style.display = 'flex';
}

function fecharModalMural() {
    document.getElementById('modal-mural').style.display = 'none';
    document.getElementById('mural-titulo').value = '';
    document.getElementById('mural-legenda').value = '';
    document.getElementById('mural-media-input').value = '';
}

function salvarLembrancaMural() {
    const titulo = document.getElementById('mural-titulo').value.trim();
    const legenda = document.getElementById('mural-legenda').value.trim();
    const fileInput = document.getElementById('mural-media-input');
    const file = fileInput.files[0];

    if (!titulo || !legenda) {
        mostrarToast('Preencha pelo menos o título e a descrição!');
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const mediaData = e.target.result;
            const mediaType = file.type.startsWith('video') ? 'video' : 'image';
            guardarLembranca(titulo, legenda, mediaData, mediaType);
        };
        reader.readAsDataURL(file);
    } else {
        guardarLembranca(titulo, legenda, null, null);
    }
}

function guardarLembranca(titulo, legenda, mediaData, mediaType) {
    const lembrancas = JSON.parse(localStorage.getItem(STORAGE_KEYS.MURAL) || '[]');
    lembrancas.unshift({
        id: Date.now(),
        titulo,
        legenda,
        mediaData,
        mediaType
    });
    localStorage.setItem(STORAGE_KEYS.MURAL, JSON.stringify(lembrancas));

    fecharModalMural();
    carregarMural();
    mostrarToast('Lembrança salva no Mural! 💖');
}

function carregarMural() {
    const container = document.getElementById('mural-container');
    const lembrancas = JSON.parse(localStorage.getItem(STORAGE_KEYS.MURAL) || '[]');

    if (lembrancas.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Nenhuma lembrança salva ainda.</p>';
        return;
    }

    container.innerHTML = lembrancas.map(item => {
        let mediaHtml = '';
        if (item.mediaData) {
            if (item.mediaType === 'video') {
                mediaHtml = `<video src="${item.mediaData}" controls></video>`;
            } else {
                mediaHtml = `<img src="${item.mediaData}" alt="Foto da lembrança">`;
            }
        }

        return `
            <div class="mural-card">
                <button class="delete-btn" onclick="deletarLembranca(${item.id})">🗑️</button>
                ${mediaHtml}
                <h5>${item.titulo}</h5>
                <p>${item.legenda}</p>
            </div>
        `;
    }).join('');
}

function deletarLembranca(id) {
    let lembrancas = JSON.parse(localStorage.getItem(STORAGE_KEYS.MURAL) || '[]');
    lembrancas = lembrancas.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.MURAL, JSON.stringify(lembrancas));
    carregarMural();
}

// --- MISSÕES DIÁRIAS (RESET AUTOMÁTICO) ---
function verificarEAtualizarMissoesDiarias() {
    const hoje = new Date().toDateString();
    const ultimaData = localStorage.getItem(STORAGE_KEYS.ULTIMA_DATA_MISSOES);

    let missoes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MISSOES));

    // Se mudou de dia ou não tem missões salvas, reseta o progresso
    if (ultimaData !== hoje || !missoes) {
        missoes = missoesBase.map(m => ({ ...m, concluida: false }));
        localStorage.setItem(STORAGE_KEYS.MISSOES, JSON.stringify(missoes));
        localStorage.setItem(STORAGE_KEYS.ULTIMA_DATA_MISSOES, hoje);
    }

    carregarMissoes();
}

function carregarMissoes() {
    const missoes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MISSOES) || '[]');
    const container = document.getElementById('lista-missoes');

    container.innerHTML = missoes.map(m => `
        <div class="item-card">
            <div>
                <strong>${m.titulo}</strong>
                <div style="font-size:0.85rem; color:var(--text-muted);">+${m.recompensa} moedas</div>
            </div>
            <button class="action-btn" ${m.concluida ? 'disabled style="background:#475569;"' : ''} 
                onclick="concluirMissao(${m.id})">
                ${m.concluida ? 'Concluída ✓' : 'Cumprir 🎯'}
            </button>
        </div>
    `).join('');
}

function concluirMissao(id) {
    let missoes = JSON.parse(localStorage.getItem(STORAGE_KEYS.MISSOES));
    const missao = missoes.find(m => m.id === id);

    if (missao && !missao.concluida) {
        missao.concluida = true;
        localStorage.setItem(STORAGE_KEYS.MISSOES, JSON.stringify(missoes));
        alterarMoedas(missao.recompensa);
        carregarMissoes();
        confetti();
        mostrarToast(`Parabéns! +${missao.recompensa} moedas!`);
    }
}

// --- LOJA E CUPONS ---
function carregarLoja() {
    const container = document.getElementById('lista-loja');
    container.innerHTML = itensLoja.map(item => `
        <div class="item-card">
            <div>
                <strong>${item.titulo}</strong>
                <div style="font-size:0.85rem; color:var(--text-muted);">🪙 ${item.preco} moedas</div>
            </div>
            <button class="action-btn" onclick="resgatarItem(${item.id})">Resgatar 🍿</button>
        </div>
    `).join('');
}

function resgatarItem(id) {
    const item = itensLoja.find(i => i.id === id);
    const moedasAtuais = parseInt(localStorage.getItem(STORAGE_KEYS.MOEDAS) || 0);

    if (moedasAtuais < item.preco) {
        mostrarToast('Moedas insuficientes para este mimo! 😅');
        return;
    }

    alterarMoedas(-item.preco);

    // Gerar Cupom
    const novoCupom = {
        id: Date.now(),
        codigo: 'CUPOM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        titulo: item.titulo,
        data: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        usado: false
    };

    const cupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUPONS) || '[]');
    cupons.unshift(novoCupom);
    localStorage.setItem(STORAGE_KEYS.CUPONS, JSON.stringify(cupons));

    // Exibir no Modal
    const modalDetalhe = document.getElementById('cupom-detalhe');
    modalDetalhe.innerHTML = `
        <h4>${novoCupom.titulo}</h4>
        <div class="cupom-code">${novoCupom.codigo}</div>
        <p style="font-size:0.8rem; color:var(--text-muted);">Gerado em: ${novoCupom.data}</p>
    `;

    document.getElementById('modal-cupom').style.display = 'flex';
    carregarCupons();
    confetti();
}

function fecharModalCupom() {
    document.getElementById('modal-cupom').style.display = 'none';
}

function carregarCupons() {
    const container = document.getElementById('lista-cupons');
    const cupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUPONS) || '[]');

    if (cupons.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Nenhum cupom resgatado ainda.</p>';
        return;
    }

    container.innerHTML = cupons.map(c => `
        <div class="cupom-card" style="${c.usado ? 'opacity: 0.5;' : ''}">
            <h4>${c.titulo}</h4>
            <div class="cupom-code">${c.codigo}</div>
            <p style="font-size:0.8rem; color:var(--text-muted);">Resgatado em ${c.data}</p>
            <button class="action-btn" style="margin-top:10px; width:100%;" 
                onclick="marcarCupomUsado(${c.id})" ${c.usado ? 'disabled' : ''}>
                ${c.usado ? 'Já Utilizado ✓' : 'Usar / Marcar como Usado 🎟️'}
            </button>
        </div>
    `).join('');
}

function marcarCupomUsado(id) {
    let cupons = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUPONS) || '[]');
    const cupom = cupons.find(c => c.id === id);
    if (cupom) {
        cupom.usado = true;
        localStorage.setItem(STORAGE_KEYS.CUPONS, JSON.stringify(cupons));
        carregarCupons();
        mostrarToast('Cupom marcado como utilizado!');
    }
}

// --- ENCONTROS (WHATSAPP) ---
function agendarEncontro() {
    const data = document.getElementById('date-input').value;
    const hora = document.getElementById('time-input').value;
    const local = document.getElementById('place-input').value;
    const notas = document.getElementById('notes-input').value;
    const telefone = document.getElementById('phone-input').value.replace(/\D/g, '');

    if (!data || !hora || !local || !telefone) {
        mostrarToast('Preencha data, hora, local e telefone!');
        return;
    }

    const mensagem = `🌹 *Convite para Date Especial!* 🌹\n\n📅 *Data:* ${data}\n⏰ *Horário:* ${hora}\n📍 *Local:* ${local}\n📝 *Notas:* ${notas || 'Nenhuma'}\n\nAceita esse encontro comigo? ❤️`;
    const urlWhatsapp = `https://api.whatsapp.com/send?phone=${telefone}&text=${encodeURIComponent(mensagem)}`;

    window.open(urlWhatsapp, '_blank');
}

// --- JOGOS / ROLETA ---
function rodarRoleta() {
    const display = document.getElementById('roulette-display');
    let contador = 0;

    const intervalo = setInterval(() => {
        const opcaoSorteada = atividadesRoleta[Math.floor(Math.random() * atividadesRoleta.length)];
        display.innerText = opcaoSorteada;
        contador++;

        if (contador > 15) {
            clearInterval(intervalo);
            confetti();
        }
    }, 100);
}

function abrirSurpresa() {
    const mensagens = [
        "Você é a minha pessoa favorita no mundo todo! ❤️",
        "Cada segundo ao seu lado vale a pena. ✨",
        "Obrigado(a) por ser meu par perfeito! 💑",
        "Eu te amo mais do que ontem e menos que amanhã! 💕",
        "Com você, qualquer lugar vira o meu lugar favorito. 🌹"
    ];
    const sorteada = mensagens[Math.floor(Math.random() * mensagens.length)];
    mostrarToast(sorteada);
}

// --- UTILITÁRIOS ---
function mostrarToast(mensagem) {
    const toast = document.getElementById('custom-toast');
    toast.innerText = mensagem;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}
