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
import {faInfoCircle, faSignOut, faTimes} from "@fortawesome/free-solid-svg-icons";


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
                <div className="hello">
                    <span>{hello}</span>
                    <FontAwesomeIcon icon={faSignOut} className="danger" onClick={logout} title="Выйти"/>
                </div>
            )}
                <Routes>
                    <Route path="/" element={<Auth user={user} setUser={setUser}
                                                   message={message} setMessage={setMessage} messageId={messageId} setMessageId={setMessageId}
                                                   setHello={setHello}/>}/>
                    <Route path="/employee" element={<Employee user={user}
                                                               message={message} setMessage={setMessage} messageId={messageId} setMessageId={setMessageId}
                                                               nomenclatureChanged={nomenclatureChanged} setNomenclatureChanged={setNomenclatureChanged}
                                                               storageChanged={storageChanged} setStorageChanged={setStorageChanged}
                                                               requestCreated={requestCreated} setRequestCreated={setRequestCreated}/>}/>

                    <Route path="/storekeeper" element={<Storekeeper user={user}
                                                                     message={message} setMessage={setMessage} messageId={messageId} setMessageId={setMessageId}
                                                                     nomenclatureChanged={nomenclatureChanged} setNomenclatureChanged={setNomenclatureChanged}
                                                                     storageChanged={storageChanged} setStorageChanged={setStorageChanged}
                                                                     requestCreated={requestCreated} setRequestCreated={setRequestCreated}/>}/>
                </Routes>
        </div>
    );
};

export const getMessageIcon = (messageId) => {
    let color;
    let title;
    switch (messageId % 10) {
        case 1:
            color = 'red';
            title = 'Критически важное';
            break;
        case 2:
            color = 'orange'
            title = 'Обратите внимание';
            break;
        case 3:
            color = 'blue'
            title = 'Информационный';
            break;
    }
    return <FontAwesomeIcon icon={faInfoCircle} style={{ color: color, fontSize: "20px" }} title={title} />
}

export const getButtonIcon = (icon, title, func) => {
    let className = "icon-foreground"
    if (title === "Удалить")
        className += " danger";

    return (
        <div className="icon-stack action">
            <FontAwesomeIcon icon={['far', 'square']} className="icon-background" />
            <FontAwesomeIcon icon={icon} className={className} title={title} onClick={func}/>
        </div>
    )

}

export const resetMessage = (setMessage, setMessageId) => {
    setMessage('');
    setMessageId(null);
}

export const showMessage = (message, messageId, setMessage, setMessageId) => {
    return (
        <div className="message">
            <span>{getMessageIcon(messageId)}</span>
            <span>{message}</span>
            <FontAwesomeIcon icon={faTimes} className="danger" onClick={() => {resetMessage(setMessage, setMessageId)}} title="Закрыть"/>
        </div>
    )
}


root.render(
    <React.StrictMode>
        <BrowserRouter>
            <ReactEntry/>
        </BrowserRouter>
    </React.StrictMode>
);

