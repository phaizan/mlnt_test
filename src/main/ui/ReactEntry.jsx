import React, { useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import './styles/Styles.css'
import {getUserData} from "./pages/Auth";
import axios from 'axios';
import Auth from "./pages/Auth";
import Employee from "./pages/Employee";
import Storekeeper from "./pages/Storekeeper";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";


axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));

const ReactEntry = () => {

    const [storageChanged, setStorageChanged] = useState(false);
    const [nomenclatureChanged, setNomenclatureChanged] = useState(false);
    const [requestCreated, setRequestCreated] = useState(false);
    const [user, setUser] = useState({});
    const [hello, setHello] = useState('');
    const [message, setMessage] = useState('');
    const [messageId, setMessageId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const data = await getUserData();
            setUser(data);
            console.log(data);
        }
        fetchUserData();
    }, [hello]);

    const logout = async () => {
        try {
            await axios.post('http://localhost:8080/api/user/logout')
            setUser({});
            setHello('');
            setMessage('');
            setMessageId(null);
            navigate("/")
        }
        catch (e) {
            console.error('Ошибка при выходе', e);
        }

    };

    return (
        <div className="body">
            {hello && (
                <div className="message">
                    <p>{hello} <button className="btn btn-danger" onClick={logout}>Выйти</button></p>
                </div>
            )}
                <Routes>
                    <Route path="/" element={<Auth user={user} setUser={setUser}
                                                   message={message} setMessage={setMessage}
                                                   setHello={setHello}/>}/>
                    <Route path="/employee" element={<Employee user={user}
                                                               message={message} setMessage={setMessage} messageId={messageId} setMessageId={setMessageId}
                                                               nomenclatureChanded={nomenclatureChanged} setNomenclatureChanged={setNomenclatureChanged}
                                                               storageChanged={storageChanged} setStorageChanged={setStorageChanged}
                                                               requestCreated={requestCreated} setRequestCreated={setRequestCreated}/>}/>

                    <Route path="/storekeeper" element={<Storekeeper user={user}
                                                                     message={message} setMessage={setMessage} messageId={messageId} setMessageId={setMessageId}
                                                                     nomenclatureChanded={nomenclatureChanged} setNomenclatureChanged={setNomenclatureChanged}
                                                                     storageChanged={storageChanged} setStorageChanged={setStorageChanged}
                                                                     requestCreated={requestCreated} setRequestCreated={setRequestCreated}/>}/>
                </Routes>

















            {/*{user && (
                <div >
                    <p>Привет, {user.name} <button className="btn btn-danger" onClick={logout}>Выйти</button></p>

                </div>
            )}

                <nav>
                    <ul>
                        <li><Link to="/">Главная</Link></li>
                        <li><Link to="/UserManager">Авторизация</Link></li>
                        {
                            user && (
                                <>
                                    <li><Link to="/StorageManager">Список остатков</Link></li>
                                    <li><Link to="/RequestManager">Список моих заявок</Link></li>
                                    {
                                        (user.roleId !== 1) && (
                                            <>
                                                <li><Link to="/StorageManager">Список остатков</Link></li>
                                                <li><Link to="/NomenclatureManager">Управление номенклатурой</Link></li>
                                                <li><Link to="/RequestManager">Управление заявками</Link></li>
                                            </>
                                        )
                                    }
                                </>)
                        }
                        <li><Link to="/">Главная</Link></li>
                        <li><Link to="/UserManager">Авторизация</Link></li>
                        <li><Link to="/NomenclatureManager">Управление номенклатурой</Link></li>
                        <li><Link to="/StorageManager">Управление остатками</Link></li>
                        <li><Link to="/RequestManager">Управление заявками</Link></li>
                    </ul>
                </nav>



                <Routes>
                    <Route path="/"/>
                    <Route path="/UserManager" element={<UserManager message={message} setMessage={setMessage} user={user} setUser={setUser}/>} />
                    <Route path="/NomenclatureManager" element={<NomenclatureManager setMessage={setMessage}/>} />
                    <Route path="/StorageManager" element={<StorageManager setMessage={setMessage}/>} />
                    <Route path="/RequestManager" element={<RequestManager setMessage={setMessage}/>} />
                </Routes>*/}
        </div>

    );
};

export  const getMessageIcon = (messageId) => {
    let color;

    switch (messageId % 10) {
        case 1:
            color = 'red';
            break;
        case 2:
            color = 'orange'
            break;
        case 3:
            color = 'blue'
            break;
    }
    return <FontAwesomeIcon icon={faInfoCircle} style={{ color: color }} />
}


root.render(
    <React.StrictMode>
        <BrowserRouter>
            <ReactEntry/>
        </BrowserRouter>
    </React.StrictMode>
);

