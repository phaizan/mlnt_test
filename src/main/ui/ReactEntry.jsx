import React, { useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import NomenclatureManager from "./component/NomenclatureManager";
import {BrowserRouter, Link, Route, Router, Routes, useNavigate} from "react-router-dom";
import StorageManager from "./component/StorageManager";
import RequestManager from "./component/RequestManager";
import './styles/Styles.css'
import UserManager, {getUserData} from "./component/UserManager";
import axios from 'axios';
import Auth from "./pages/Auth";
import Employee from "./pages/Employee";
import Storekeeper from "./pages/Storekeeper";

axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));

const ReactEntry = () => {

    const [user, setUser] = useState({});
    const [hello, setHello] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    /*useEffect(() => {
        const fetchUserData = async () => {
            const data = await getUserData();
            setUser(data);
            console.log(data);
        }
        fetchUserData();
    }, [message]);

    */

    const logout = async () => {
        try {
            await axios.post('http://localhost:8080/api/user/logout')
            setUser({});
            setMessage("Вы вышли из системы");
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
                    <Route path="/" element={<Auth setUser={setUser} setMessage={setMessage} setHello={setHello}/>}/>
                    <Route path="/employee" element={<Employee user={user} setMessage={setMessage}/>}/>
                    <Route path="/storekeeper" element={<Storekeeper user={user} setMessage={setMessage}/>}/>
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


root.render(
    <React.StrictMode>
        <BrowserRouter>
            <ReactEntry/>
        </BrowserRouter>
    </React.StrictMode>
);

