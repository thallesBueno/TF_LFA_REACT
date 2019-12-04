const resolve = (m,word) => {
    if(!m){
        return false;
    }

    let actualState = m.initialState;
    let error = false;
    let message = '';

    for(let symbol of word){
        if(!m.symbols.includes(symbol)){
            message = (`simbolo "${symbol}" não pertence ao alfabeto`);
            error = true;
            break;
        }

        const possibleFunctions = m.functions.filter(f => f.state === actualState && f.symbol === symbol);

        if(possibleFunctions.length === 0){
            message = (`não existe transição com o simbolo "${symbol}" no estado "${actualState}"`);
            error = true;
            break;
        }
        
        if(possibleFunctions.length > 1){
            message = ('automato não é deterministico');
            error = true;
            break;
        }

        const myFunction = possibleFunctions[0];
        actualState = myFunction.destiny;
    }

    if(!error && m.finalStates.includes(actualState)){
        return {result: true};
    }else{
        if(!error)
        {
            message += (`\n estado "${actualState}" não é um estado final`);
        }
        
        return {result: false, message};
    }
 };

const afn2afd = afn => {
    // Estados que não foram checados ainda
    let unchecked = [[afn.initialState]];
    let checked = [];
    const prog = {}; // Funções de transição
    while (unchecked.length > 0) {
        const testingState = unchecked.pop();
        checked.push(testingState); // Marca estado atual como checado

        let possibleFunctions = [] // Lista as possíveis transições a partir do estado atual
        for (let state of testingState) {
            possibleFunctions = possibleFunctions.concat( afn.functions.filter(f => f.state === state ));
        }
        
        let newStates = []
        for (let symbol of afn.symbols) { // A partir das transições, verifica todos os estados alcançados para cada simbolo
            // Gera uma lista com todos os estados
            let possibleStates = possibleFunctions.filter(f => f.symbol == symbol).map(a => a.destiny);
            newStates.push(possibleStates);
            prog[testingState] = newStates; // Usa a lista como chave do objeto(transforma para string automatico)
        }

        newStates = newStates.filter(f => f.length > 0); // Este filtro parece ser inutil e não me lembro oque eu tinha na cabeça quando fiz

        for (let state of newStates) { // Verifica quais dos estados gerados não foram checados ainda
            if (checked.filter(f => arraysEqual(f, state)).length === 0) {
                unchecked.push(state);
            }
        }
    }

    const newKeys = {};
    const keys = Object.keys(prog);
    keys.forEach((elem, index) => newKeys[elem] = `e${index}`);
    const initialState = newKeys[keys.filter(f => f === afn.initialState)];
    const finalStates = keys.filter(f => afn.finalStates.some(elem => f.indexOf(elem) >= 0)).map(f => newKeys[f]);

    const functions = []; // Gera todos as funções de transição com os novos nomes. Remove simbolos sem transição.
    Object.entries(prog).forEach(elem => elem[1].forEach((f, index) => { if (f.length > 0) functions.push({state: newKeys[elem[0]], symbol: afn.symbols[index] , destiny: newKeys[f]})}));

    return {
        name: afn.name,
        states: Object.entries(newKeys).map(elem => elem[1]),
        symbols: afn.symbols,
        initialState: initialState,
        finalStates: finalStates,
        functions: functions
    }

}

const arraysEqual = (arr1, arr2) => {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

const parser = content => {
    const afn = {}

    afn.name = /\w+/.exec(content[0])[0];
    const temp = /\(.+\)/.exec(content[0])[0].slice(1, -1).split(/,\s(?![^{]*\})/g);
    afn.states = temp[0].slice(1, -1).split(', ');
    afn.symbols = temp[1].slice(1, -1).split(', ');
    afn.initialState = temp[2];
    afn.finalStates = temp[3].slice(1, -1).split(', ');

    const functions = [];
    for(let i = 2; i < content.length; i++) {
        const aux = content[i].split('=');
        const temp = aux[0].slice(1, -1).split(',');
        functions.push({state: temp[0], symbol: temp[1], destiny: aux[1]});
    }
    afn.functions = functions;
    return afn;
}

exports.resolve = resolve;
exports.afn2afd = afn2afd;
exports.parser = parser;