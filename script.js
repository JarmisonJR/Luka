// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCMfiBAOQoBAp28Y9NqMut3Y_p3HCVY7Zo",
    authDomain: "luka-cd476.firebaseapp.com",
    databaseURL: "https://luka-cd476-default-rtdb.firebaseio.com",
    projectId: "luka-cd476",
    storageBucket: "luka-cd476.firebasestorage.app",
    messagingSenderId: "663767966684",
    appId: "1:663767966684:web:db0c180c9908c2f6ff6519",
    measurementId: "G-PB337J54MV"
  };
// Inicializar Firebase e Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const DATA_INICIO_NAMORO = new Date("2023-01-01T00:00:00");

const missoesBase = [
    { id: "m1", titulo: "Assistir um filme juntos", recompensa: 50 },
    { id: "m2", titulo: "Cozinhar uma receita nova", recompensa: 100 },
    { id: "m3", titulo: "Fazer um passeio ao ar livre", recompensa: 80 },
    { id: "m4", titulo: "Escrever uma mensagem carinhosa", recompensa: 60 }
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
    ouvirMoedas();
    ouvirMural();
    ouvirDiario();
    ouvirDatasImportantes();
    ouvirMissoes();
    carregarLoja();
    ouvirCupons();
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

// --- MOEDAS (FIREBASE) ---
function ouvirMoedas() {
    db.collection('geral').doc('moedas').onSnapshot(doc => {
        const total = doc.exists ? doc.data().valor : 0;
        document.getElementById('moedas-count').innerText = total;
    });
}

async function alterarMoedas(qtd) {
    const docRef = db.collection('geral').doc('moedas');
    const doc = await docRef.get();
    let atual = doc.exists ? doc.data().valor : 0;
    await docRef.set({ valor: atual + qtd });
}

// --- TELA: DIÁRIO SEMANAL (FIREBASE) ---
// Melhora na abertura do modal do Diário
function abrirModalDiario(id = null) {
    const modal = document.getElementById('modal-diario');
    const inputId = document.getElementById('diario-edit-id');
    const inputTitulo = document.getElementById('diario-titulo');
    const inputConteudo = document.getElementById('diario-conteudo');
    const modalTitulo = document.getElementById('diario-modal-titulo');

    if (id) {
        db.collection('diario').doc(id).get().then(doc => {
            if (doc.exists) {
                const item = doc.data();
                inputId.value = doc.id;
                inputTitulo.value = item.titulo;
                inputConteudo.value = item.conteudo;
                modalTitulo.innerText = "Editar Registro Semanal";
                modal.classList.add('active'); // Usar classe em vez de mexer direto no style
                modal.style.display = 'flex';
            }
        });
    } else {
        inputId.value = '';
        inputTitulo.value = '';
        inputConteudo.value = '';
        modalTitulo.innerText = "Novo Registro Semanal";
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function fecharModalDiario() {
    const modal = document.getElementById('modal-diario');
    modal.classList.remove('active');
    modal.style.display = 'none';
}

async function salvarDiario() {
    const id = document.getElementById('diario-edit-id').value;
    const titulo = document.getElementById('diario-titulo').value.trim();
    const conteudo = document.getElementById('diario-conteudo').value.trim();

    if (!titulo || !conteudo) {
        mostrarToast('Preencha a semana e o relato!');
        return;
    }

    const dados = {
        titulo,
        conteudo,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (id) {
        await db.collection('diario').doc(id).update(dados);
    } else {
        await db.collection('diario').add(dados);
    }

    fecharModalDiario();
    mostrarToast('Diário salvo no Firebase! 📖');
}

function ouvirDiario() {
    db.collection('diario').orderBy('criadoEm', 'desc').onSnapshot(snapshot => {
        const container = document.getElementById('lista-diario');
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Nenhum relato no diário ainda.</p>';
            return;
        }

        container.innerHTML = snapshot.docs.map(doc => {
            const item = doc.data();
            return `
                <div class="diario-card">
                    <div class="card-actions">
                        <button class="card-btn" onclick="abrirModalDiario('${doc.id}')">✏️</button>
                        <button class="card-btn delete" onclick="deletarDiario('${doc.id}')">🗑️</button>
                    </div>
                    <h5>${item.titulo}</h5>
                    <p>${item.conteudo}</p>
                </div>
            `;
        }).join('');
    });
}

function deletarDiario(id) {
    db.collection('diario').doc(id).delete();
}

// --- TELA: DATAS IMPORTANTES (FIREBASE) ---
async function salvarDataImportante() {
    const titulo = document.getElementById('data-titulo').value.trim();
    const dataEvento = document.getElementById('data-evento').value;

    if (!titulo || !dataEvento) {
        mostrarToast('Preencha o título e a data!');
        return;
    }

    await db.collection('datas').add({ titulo, dataEvento });

    document.getElementById('data-titulo').value = '';
    document.getElementById('data-evento').value = '';

    mostrarToast('Data salva com sucesso! 📅');
}

function ouvirDatasImportantes() {
    db.collection('datas').onSnapshot(snapshot => {
        const container = document.getElementById('lista-datas');
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Nenhuma data importante cadastrada.</p>';
            return;
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        lista.sort((a, b) => new Date(a.dataEvento) - new Date(b.dataEvento));

        container.innerHTML = lista.map(item => {
            const dataEv = new Date(item.dataEvento + 'T00:00:00');
            const diffTempo = dataEv - hoje;
            const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

            let statusTexto = '';
            let eAlerta = false;

            if (diffDias === 0) {
                statusTexto = '🎉 É HOJE!';
                eAlerta = true;
            } else if (diffDias > 0 && diffDias <= 7) {
                statusTexto = `🚨 Faltam apenas ${diffDias} dia(s)!`;
                eAlerta = true;
            } else if (diffDias > 0) {
                statusTexto = `Faltam ${diffDias} dias`;
            } else {
                statusTexto = `Passou há ${Math.abs(diffDias)} dias`;
            }

            const dataFormatada = dataEv.toLocaleDateString('pt-BR');

            return `
                <div class="data-card ${eAlerta ? 'alerta' : ''}">
                    <div class="card-actions">
                        <button class="card-btn delete" onclick="deletarDataImportante('${item.id}')">🗑️</button>
                    </div>
                    ${eAlerta ? `<span class="badge-alerta">${statusTexto}</span>` : ''}
                    <h5>${item.titulo}</h5>
                    <p style="font-size:0.9rem; color:var(--text-muted);">Data: ${dataFormatada}</p>
                    ${!eAlerta ? `<p style="font-size:0.85rem; margin-top:5px;">${statusTexto}</p>` : ''}
                </div>
            `;
        }).join('');
    });
}

function deletarDataImportante(id) {
    db.collection('datas').doc(id).delete();
}

// --- TELA: MURAL DE LEMBRANÇAS (FIREBASE) ---
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
        mostrarToast('Preencha título e descrição!');
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

async function guardarLembranca(titulo, legenda, mediaData, mediaType) {
    await db.collection('mural').add({
        titulo,
        legenda,
        mediaData,
        mediaType,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    });

    fecharModalMural();
    mostrarToast('Lembrança salva no Mural! 💖');
}

function ouvirMural() {
    db.collection('mural').orderBy('criadoEm', 'desc').onSnapshot(snapshot => {
        const container = document.getElementById('mural-container');
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Nenhuma lembrança salva ainda.</p>';
            return;
        }

        container.innerHTML = snapshot.docs.map(doc => {
            const item = doc.data();
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
                    <div class="card-actions">
                        <button class="card-btn delete" onclick="deletarLembranca('${doc.id}')">🗑️</button>
                    </div>
                    ${mediaHtml}
                    <h5>${item.titulo}</h5>
                    <p>${item.legenda}</p>
                </div>
            `;
        }).join('');
    });
}

function deletarLembranca(id) {
    db.collection('mural').doc(id).delete();
}

// --- MISSÕES DIÁRIAS (FIREBASE) ---
function ouvirMissoes() {
    const hoje = new Date().toDateString();

    db.collection('missoes').onSnapshot(snapshot => {
        const container = document.getElementById('lista-missoes');
        
        container.innerHTML = missoesBase.map(mBase => {
            const docEncontrado = snapshot.docs.find(d => d.id === mBase.id);
            const dadosDoc = docEncontrado ? docEncontrado.data() : null;
            const concluida = dadosDoc && dadosDoc.dataConclusao === hoje;

            return `
                <div class="item-card">
                    <div>
                        <strong>${mBase.titulo}</strong>
                        <div style="font-size:0.85rem; color:var(--text-muted);">+${mBase.recompensa} moedas</div>
                    </div>
                    <button class="action-btn" ${concluida ? 'disabled style="background:#475569;"' : ''} 
                        onclick="concluirMissao('${mBase.id}', ${mBase.recompensa})">
                        ${concluida ? 'Concluída ✓' : 'Cumprir 🎯'}
                    </button>
                </div>
            `;
        }).join('');
    });
}

async function concluirMissao(id, recompensa) {
    const hoje = new Date().toDateString();
    await db.collection('missoes').doc(id).set({ dataConclusao: hoje });
    await alterarMoedas(recompensa);
    confetti();
    mostrarToast(`Parabéns! +${recompensa} moedas!`);
}

// --- LOJA E CUPONS (FIREBASE) ---
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

async function resgatarItem(id) {
    const item = itensLoja.find(i => i.id === id);
    const docMoedas = await db.collection('geral').doc('moedas').get();
    const moedasAtuais = docMoedas.exists ? docMoedas.data().valor : 0;

    if (moedasAtuais < item.preco) {
        mostrarToast('Moedas insuficientes para este mimo! 😅');
        return;
    }

    await alterarMoedas(-item.preco);

    const novoCupom = {
        codigo: 'CUPOM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        titulo: item.titulo,
        data: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        usado: false,
        criadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('cupons').add(novoCupom);

    const modalDetalhe = document.getElementById('cupom-detalhe');
    modalDetalhe.innerHTML = `
        <h4>${novoCupom.titulo}</h4>
        <div class="cupom-code">${novoCupom.codigo}</div>
        <p style="font-size:0.8rem; color:var(--text-muted);">Gerado em: ${novoCupom.data}</p>
    `;

    document.getElementById('modal-cupom').style.display = 'flex';
    confetti();
}

function fecharModalCupom() {
    document.getElementById('modal-cupom').style.display = 'none';
}

function ouvirCupons() {
    db.collection('cupons').orderBy('criadoEm', 'desc').onSnapshot(snapshot => {
        const container = document.getElementById('lista-cupons');
        if (snapshot.empty) {
            container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Nenhum cupom resgatado ainda.</p>';
            return;
        }

        container.innerHTML = snapshot.docs.map(doc => {
            const c = doc.data();
            return `
                <div class="cupom-card" style="${c.usado ? 'opacity: 0.5;' : ''}">
                    <h4>${c.titulo}</h4>
                    <div class="cupom-code">${c.codigo}</div>
                    <p style="font-size:0.8rem; color:var(--text-muted);">Resgatado em ${c.data}</p>
                    <button class="action-btn" style="margin-top:10px; width:100%;" 
                        onclick="marcarCupomUsado('${doc.id}')" ${c.usado ? 'disabled' : ''}>
                        ${c.usado ? 'Já Utilizado ✓' : 'Usar / Marcar como Usado 🎟️'}
                    </button>
                </div>
            `;
        }).join('');
    });
}

function marcarCupomUsado(id) {
    db.collection('cupons').doc(id).update({ usado: true });
    mostrarToast('Cupom marcado como utilizado!');
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
