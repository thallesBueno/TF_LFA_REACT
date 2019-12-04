import React, { useState, useEffect } from 'react';
import util from './util';
import "./App.css";

function App() {
  
  const [word, setWord] = useState("");
  const [text, setText] = useState("");
  const [afd, setAfd] = useState(null);

  let fileReader;

  const changeAfn = () => {
    if(text)
    {
      const aux = util.parser(text.split('\n').map(x => x.trim()));
      setAfd(util.afn2afd(aux));
      setWord("");
    }
  };

  useEffect(changeAfn, [text]);
  
  const handleFileRead = (e) => {
    const content = fileReader.result;
    setText(content);
  }

  const handleFileChange = (file) => {
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);

  }
  
  const renderFunction = f => (
    <p>{`(${f.state},${f.symbol},${f.destiny})`}</p>
  )

  const renderAutomato = () => (
    <>
      <h4>{`Automato finito deterministico: ${afd.name}`}</h4>
      <p>{`estados: {${afd.states}}`}</p>
      <p>{`estados finais: {${afd.finalStates}}`}</p>
      <p>{`simbolos: ${afd.symbols}`}</p>
      <p>{`estado incical: ${afd.initialState}`}</p>
      <p>transições (estado,simbolo, destino): </p>
      {afd.functions.map(f => renderFunction(f))}
    </>
  );

  return (
    <div className="container">
        <div className="fileContainer">
          <p>Escolha um arquivo: </p>
          <input 
            type="file" 
            accept=".txt"
            onChange={e => handleFileChange(e.target.files[0])}
          />
        </div>

        <div className="inputContainer">
          <p>Digite uma palavra para testar:</p>
          <input 
            className="wordInput"
            value={word}
            onChange={(event) => setWord(event.target.value)}
          />
          {(afd && word) 
          && <p>{`Palavra ${util.resolve(afd,word.trim()) ? "aceita" : "rejeitada"}`}</p>}
        </div>

      <div className="containerAutomato">
        {afd ? renderAutomato() : <p>Escolha um arquivo para vizualizar um Autômato</p>}
      </div>
    </div>
  );
}

export default App;
