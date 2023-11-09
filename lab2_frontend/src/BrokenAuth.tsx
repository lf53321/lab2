import React, {useEffect, useState} from "react";
import ReCAPTCHA from "react-google-recaptcha";

function BrokenAuth(this: any) {
    const [vulnerable, setVulnerable] = useState(false);
    const [captcha, setCaptcha] = useState(false);
    const [seeSession, setSeeSession] = useState(false);
    const [sessionID, setSessionID] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetch('/session')
            .then((response) => response.json())
            .then((data) => {
                setIsLoggedIn(data.isAuthenticated);
                console.log(isLoggedIn)
            })
            .catch((error) => {
                console.log(error);
            });
    }, [isLoggedIn]);

    const handleLogOut = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        fetch('/logout')
            .then((response) => response.json())
            .then((data) => {
                setIsLoggedIn(data.isAuthenticated);
            })
            .catch((error) => {
                setErrMsg('Greška kod odjave');
            });
    }

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        if (!captcha && !vulnerable) {
            setErrMsg("Molimo ispunite CAPTCHA.")
        } else {
            fetch(!vulnerable ? '/login' : '/login/vulnerable', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                }).then((response) => response.json())
                    .then((data) => {
                        if(data.isAuthenticated) {
                            setIsLoggedIn(data.isAuthenticated);
                            let sid = document.cookie.split('; ').find((cookie) => cookie.startsWith('sessionCookie='))
                            setSessionID(sid ? sid : '')
                            setErrMsg('')
                        } else setErrMsg(data.err)
                }).catch((error) => {
                console.log(error)
                setErrMsg('Pogreška kod prijave');
            });
        }
    }

    return <div style={{border:"2px solid black", margin:"10px", borderRadius:"15px", backgroundColor:"aquamarine"}}>
        <h2>Loša autentifikacija</h2>
        <p>
            Loša autentifikacija je širok pojam koji obuhvaća više stvari vezano uz autentifikaciju. <br/>
            U ovom primjeru su prikazane tri moguće prijetnje/zaštite koje se aktiviraju pomoću kvačice Ranjivost. <br/>
            Ako je aktivirana ranjivost korisnik dobiva poruke poput <b>Korisničko ime ne postoji</b> što bi moglo pomoći napadaču <br/>
            kod napada dok ako nije aktivirana ranjivost se dobivaju općenite poruke o krivom unosu. <br/>
            Isto tako u ranjivom načinu rada napadač može jednostavno isprobavati brojne lozinke ili koristiti neki program za to, <br/>
            a u sigurnom načinu rada postoji <b>CAPTCHA</b> koja to sprječava. <br/>
            Zadnja prikazna ranjivost je vezana uz <b>Session ID</b> uz pomoć kojega napadač može ukrasti sjednicu korisniku. <br/>
            U ranjivom načinu rada je zastavica <b>httpOnly</b> na kolačiću postavljena na <b>false</b> pa napadač može doći do <br/>
            do <b>sid</b> putem javascripta (na stranici prikazano pritiskom na gumb kada se korisnik prijavi), a u sigurnom načinu rada ne može jer je <br/>
            zastavica <b>httpOnly</b> postavljena na <b>true</b>. <br/>
            Prijava se ostvaruje sa podacima username: <b>admin</b> i password: <b>qwertzy</b> (što je isto ranjivost sama po sebi, <br/>
            ali ovdje služi za demonstraciju).
             <br/>
        </p>
        <label>
            Ranjivost
            <input
                type="checkbox"
                disabled={isLoggedIn}
                checked={vulnerable}
                onChange={() => setVulnerable(!vulnerable)}
            />
        </label>
        {isLoggedIn ? <div>
            <p>Prijavljeni ste</p>
            <button style={{marginBottom:'10px'}} onClick={handleLogOut}>Odjava</button>
            <br></br>
            <button style={{marginBottom:'10px'}} onClick={() => setSeeSession(!seeSession)}>{!seeSession ? "Prikaži SID" : "Sakrij"}</button>
            <br></br>
            {!seeSession ?  <></> : <p>{sessionID}</p>}
        </div> : <form onSubmit={handleSubmit}>
            <input
                style={{width:"35vw", marginTop:'10px'}}
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <br></br>
            <input
                style={{width:"35vw", margin:'10px'}}
                id="password"
                type="text"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <br></br>
            {vulnerable ? <></> : <ReCAPTCHA onChange={() => setCaptcha(true)} style={{margin: '10px', display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}} sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY!}/>}
            <button style={{marginBottom:'10px'}} type="submit">Prijava</button>
        </form>}
        <p>{errMsg}</p>
    </div>
}

export default BrokenAuth;