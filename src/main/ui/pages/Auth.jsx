import React, { useEffect, useState} from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Auth = ({setUser, setMessage, setHello}) => {
    const [showRegistrationFrom, setShowRegistrationFrom] = useState(false);
    const [showLoginFrom, setShowLoginFrom] = useState(true);
    const [loginRequest, setLoginRequest] = useState({});
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();


    const login = async () => {
        try {
            const response = await axios.post(
                'http://localhost:8080/api/user/login',
                loginRequest
            );
            setUser(response.data);

            if (response.data.roleId === 1) navigate('/employee');
            else navigate('/storekeeper');

            setLoginRequest({});
            setShowLoginFrom(false);
            setHello(`Добро пожаловать, ${response.data.name}`);
            console.log(response.data);
        }
        catch (e) {
            console.error(e);
            setMessage(e?.response?.data || "Ошибка при авторизации");
        }
    }

    const handleLoginChange = (field, value) => {
        setLoginRequest(prev => ({...prev, [field]: value}))
    }

    return (
        <div>
            { showLoginFrom &&
            <div>
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
            </div>
            }
        </div>

    )
}

export default Auth;