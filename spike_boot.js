const wppconnect = require('@wppconnect-team/wppconnect'); // Carrega a biblioteca Wppconnect
const { match } = require('assert');
const fs = require('fs-extra');
const path = require('path');

const SESSION_NAME = 'Spike_boot';
const TOKEN_PATH = path.join(__dirname, 'tokens', SESSION_NAME);


// Descomente esta linha quando quiser forçar o logout da sessão
 //fs.removeSync(TOKEN_PATH); // ⚠️ Deleta o token salvo (desloga)

const token = new wppconnect.tokenStore.MemoryTokenStore(); // Instanciando a classe memorytoken e criando o objeto token para guardar token de autenticação

//Parte de conexão


wppconnect.create({ //Comando para iniciar conexão com o servidor
    session: 'Spike_boot', // Nome da seção criada
    autoClose: false, // impede o fechamento do boot
    tokenStore: token, // utilizando o tokenstore
  //  catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {// Essa função pega QR code na forma ASCII-para usar no terminal , Base64- para usar como imagem, URL-navegador, alem disso ATTEMPtS contem quantidade de tentativas de gerar o QR
  //    console.log('Conecte seu Whatsapp com o QrCode\n',asciiQR); //Exibe o QR code no terminal
  //  },
    puppeteerOptions:{
        args:['--no-sandbox']// desativa a camada de segurança sandbox pois ela pode causar erro no puppeteer utilizado pela wppconnect para controlar o navegador
    }

})
.then((Client) => start(Client)) // Inicia o cliente após a criação ser bem sucedida e passa o objeto client para função start 
.catch((error) =>{
    console.log('Ocorreu um erro ao iniciar o spike boot', error);// reporta se houve algum erro na inicialização do boot
}); 



// Gestão de mensagens
let ativacao = false;
let cont =0;
function start(client){ //inicia o cliente
    client.onMessage((message) => { // onMenssage monitora a chegada de mensagens no whatsapp
        if (message.body === '1405'){ // verifica se a mensagem é o codigo de ativação 1405
            const remetente = message.from;
            const mensagem = message.body;
            ativacao = true; // atualiza o status de ativacao
            console.log(remetente,message.body); // exibe o remetente e a mesnsagem recebida no console
            client.sendText(message.from,'Você acaba de chamar o Spike boot, na função sorteio de amigo secreto. Digite o nome dos participantes separados por " , " Exemplo:\n juliana,joao,antonia,vitor'); // Envia mensagem para o remetente
            cont=0 // zera o contador que controla o acesso ao sorteador
        }
       
        if(ativacao === true ){
                mensagem = message.body;
                const lista_wpp_mensagem = mensagem.split(',').map(nome => nome.trim()); // preenche o array com a quebra da mensagem seprara por ","
                console.log("Lista recebida ", lista_wpp_mensagem)
                console.log("o contador esta em ", cont)
                cont++; //implementa o contador para controlar o recebimento da lista
                
                if(cont === 2){
                    const resultado = sorteio(lista_wpp_mensagem);
                    client.sendText(message.from, `o resultado do amigo secreto foi enviado`);
                    client.sendText('***@c.us', `🤫 A pessoa que você tirou no amigo secreto foi:\n${resultado[0][1]}`); //subistitua *** pelo numero do participante 1 com codigo de pais e area ex: 557199999999
                    client.sendText('***@c.us', `🤫 A pessoa que você tirou no amigo secreto foi:\n${resultado[1][1]}`); //subistitua *** pelo numero do participante 2 com codigo de pais e area ex: 557199999999
                    client.sendText('***@c.us', `🤫 A pessoa que você tirou no amigo secreto foi:\n${resultado[2][1]}`); //subistitua *** pelo numero do participante 3 com codigo de pais e area ex: 557199999999

                    console.table(resultado); //ative essa linha se quiser ver o resultado no terminal
                    
                    ativacao = false; // desativa o status apos recebimento da lista
                }
                
                
        } console.log(message.body)
            
        
        
        
    });
};


// sorteio

function sorteio(lista_wpp){
lista = [...lista_wpp];
const matriz_resultado = [];// matriz que guarda o resultado final

let k =0;
while(k < lista.length){ //laço que preenche a matriz com nome dos participantes
    matriz_resultado.push([lista[k],null]); // comando push implemanta novas linhas na matriz
    k++;
}

function shuflle(vetor){ // Função criada para embaralhar os nomes
    const lista_copia = [...vetor]; // cria uma copia da lista original 

    for (let i = lista_copia.length - 1 ; i > 0  ; i--){ // laço responsavel por embaralhar a lista
        const j = Math.floor(Math.random()*(i+1)); // randomização da lista
        [lista_copia[i],lista_copia[j]] = [lista_copia[j],lista_copia[i]]; // colocando nomes embaralhados em lista_copia
    }
return lista_copia;
}

let sorteado;
let tentativas = 0; // variavel criada para evitar loop infinito

do {
    sorteado = shuflle(lista);
    tentativas++;

}while(sorteado.some((nome,i) => nome === matriz_resultado[i][0])) // laço que verifica se o nome sorteado é o mesmo nome na primeira lista da matriz, para evitar auto sorteio
    if (tentativas < 300){ // controle de 300 tentativas para evitar loop infinito
        for(let i =0; i< matriz_resultado.length;i++){// laço que percorre a matriz
            matriz_resultado[i][1]= sorteado[i]; // atribui o nome sorteado na matriz
                       
        } 
    } else {
            console.log("Apos 300 tentativas não foi gerado resultado valido para o sorteio");
        }

return matriz_resultado;
}

