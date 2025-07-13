import React from 'react';
import NomenclatureManager from "../component/NomenclatureManager";
import StorageManager from "../component/StorageManager";
import RequestManager from "../component/RequestManager";

const Storekeeper = ({ user, message, setMessage, messageId, setMessageId, nomenclatureChanded, setNomenclatureChanged, storageChanged, setStorageChanged, requestCreated, setRequestCreated }) => {


    return (
        <>
            <NomenclatureManager message={message} setMessage={setMessage} messageId={messageId} setMessageId={setMessageId}
                                 setNomenclatureChanged={setNomenclatureChanged}></NomenclatureManager>
            <StorageManager user={user}
                            message={message} setMessage={setMessage} messageId={messageId} setMessageId={setMessageId}
                            nomenclatureChanded={nomenclatureChanded} setNomenclatureChanged={setNomenclatureChanged}
                            setStorageChanged={setStorageChanged}
                            requestCreated={requestCreated} setRequestCreated={setRequestCreated}></StorageManager>
            <RequestManager user={user}
                            message={message} setMessage={setMessage} messageId={messageId} setMessageId={setMessageId}
                            nomenclatureChanded={nomenclatureChanded} setNomenclatureChanged={setNomenclatureChanged}
                            storageChanged={storageChanged} setStorageChanged={setStorageChanged}
                            requestCreated={requestCreated} setRequestCreated={setRequestCreated}></RequestManager>
        </>
    )
}

export default Storekeeper