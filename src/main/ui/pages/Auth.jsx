import React, { useEffect, useState} from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Auth = ({ user, message, setMessage, setUser, setHello}) => {
    const [newUser, setNewUser] = useState({});
    const [showRegistrationFrom, setShowRegistrationFrom] = useState(false);
    const [showLoginFrom, setShowLoginFrom] = useState(false);
    const [loginRequest, setLoginRequest] = useState({});
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();

    const login = async () => {
        console.log(loginRequest);
        try {
            const response = await axios.post(
                'http://localhost:8080/api/user/login',
                loginRequest
            );
            const loggedUser = response.data;
            setUser(loggedUser);
            setLoginRequest({});
            setShowLoginFrom(true);
            if (loggedUser.roleId === 1)
                navigate('/employee')
            if (loggedUser.roleId === 2 || loggedUser.roleId === 3)
                navigate('/storekeeper')
            setHello(`Добро пожаловать, ${loggedUser.name}`);
            console.log(loggedUser);
        }
        catch (e) {
            console.error(e);
            setMessage(e?.response?.data || "Ошибка при авторизации");
        }
    }

    const registr = async () => {
        try {
            setLoginRequest({});
            console.log(newUser);
            const response = await axios.post('http://localhost:8080/api/user/registration', newUser);
            setMessage(`Пользователь ${response.data.name} зарегистрирован`);
            setShowRegistrationFrom(false);
            setShowLoginFrom(true);
        }
        catch (e) {
            setMessage(e?.response?.data || "Ошибка при регистрации");
        }
    }

    const handleLoginChange = (field, value) => {
        setLoginRequest(prev => ({...prev, [field]: value}))
    }

    const handleUserChange = (field, value) => {
        setNewUser(prev => ({...prev, [field]: value}))
    }



    useEffect(() => {
        if (user?.name) {
            if (user.roleId === 1)
                navigate('/employee')
            if (user.roleId === 2 || user.roleId === 3)
                navigate('/storekeeper')
            setHello(`Добро пожаловать, ${user.name}`);
        }

        const fetchRoles = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/user/roles');
                setRoles(response.data);
                console.log(response.data)
            }
            catch (e) {
                console.error('Ошибка при загрузке ролей', e);
                return [];
            }
        }
        fetchRoles();
    }, [user])

    return (
        <div>
            { !user && !user?.name &&
            (<>
                <button className="btn" onClick={() => {
                    setShowLoginFrom(true)
                    setShowRegistrationFrom(false);
                }}>Авторизоваться</button>

                <button className="btn" onClick={() => {
                    setShowRegistrationFrom(true);
                    setShowLoginFrom(false)
                }}>Зарегистрироваться</button>


                {showLoginFrom &&
                    <>
                        <h2>Авторизация</h2>
                        <div className="form-row">
                            <input
                                type="text"
                                required
                                value={loginRequest.login}
                                onChange={e => handleLoginChange("login", e.target.value)}
                                placeholder="Логин"
                            />
                            <input
                                type="text"
                                required
                                value={loginRequest.password}
                                onChange={e => handleLoginChange("password", e.target.value)}
                                placeholder="Пароль"
                            />
                            <button className="btn" onClick={login}>Авторизоваться</button>
                        </div>
                    </>
                }
                {showRegistrationFrom &&
                    <>
                        <h2>Регистрация</h2>
                        <div className="form-row">
                            <input
                                type="text"
                                required
                                value={newUser?.name}
                                onChange={e => handleUserChange("name", e.target.value)}
                                placeholder="Имя"
                            />
                            <input
                                type="text"
                                required
                                value={newUser?.login}
                                onChange={e => handleUserChange("login", e.target.value)}
                                placeholder="Логин"
                            />
                            <input
                                type="text"
                                required
                                value={newUser?.password}
                                onChange={e => handleUserChange("password", e.target.value)}
                                placeholder="Пароль"
                            />
                            <select
                                value={newUser?.roleId}
                                onChange={e => {
                                    handleUserChange("roleId", e.target.value)
                                }}
                            >
                                <option value="">Выберите роль пользователя</option>
                                {roles.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                            <button className="btn" onClick={registr}>Зарегистрироваться</button>
                        </div>
                    </>}

                {message && (
                    <div className="message">
                        <p>{message} <button className="btn btn-danger" onClick={() => {
                            setMessage('')
                        }}>X</button></p>
                    </div>
                )}

            </>)
            }
        </div>
    )
}

export const getUserData = async () => {
    try {
        const response = await axios.get('http://localhost:8080/api/user/data');
        return response.data;
    }
    catch (e) {
        console.error("Пользователь не авторизован");
        return null;
    }
}


export default Auth;