import React from 'react';
import ReactDOM from 'react-dom/client';
import NomenclatureManager from "./component/NomenclatureManager";

const root = ReactDOM.createRoot(
  document.getElementById('root')
);
root.render(
  <React.StrictMode>
      <div>
          <h1>Управление Номенклатурой</h1>
          <NomenclatureManager />
      </div>
  </React.StrictMode>
);

