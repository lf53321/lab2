import React, {useState} from 'react';

function SqlAttack() {
    const [vulnerable, setVulnerable] = useState(false);
    const [input, setInput] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [output, setOutput] = useState([]);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        setErrMsg('')
        setOutput([])

        if (vulnerable) {
            fetch(`/vulnerable?inputSQL=${input}`)
                .then((response) => {
                    if (response.ok) {
                        setErrMsg('')
                        return response.json();
                    } else {
                        setErrMsg('Greška');
                        return
                    }
                })
                .then((data) => {
                    setOutput(data)
                })
        } else {
            if (input.length !== 10 || typeof input !== "string") {
                setErrMsg('Pogrešan unos')
                return
            }
            fetch(`/secure?inputSQL=${input}`)
                .then((response) => {
                    if (response.ok) {
                        setErrMsg('')
                        return response.json();
                    } else {
                        setErrMsg('Greška');
                        return
                    }
                })
                .then((data) => {
                    setOutput(data)
                })
        }
    };

    return <div style={{border:"2px solid black", margin:"10px", borderRadius:"15px", backgroundColor:"aliceblue"}}>
        <h2>SQL umetanje</h2>
        <p>
            Sustav je zamišljen da student upiše svoj JMBAG (npr. <b>0036533212</b>) i vidi svoju ocjenu.<br/>
            Naravno ako netko zna JMBAG drugog studenta može vidjeti njegovu ocjenu, ali fokusirajmo se ovdje na SQL umetanje.<br/>
            Ako se ukljući ranjivost moguće je unosom <b>' OR '1'='1</b> dobiti sve parove (ime, ocjena).<br/>
            Ali tablica sadrži druge podatke do kojih se može doći ako si napadač da malo truda i isproba neke upite.<br/>
            Evo jedan primjer kako napadač može doći i do email adresa i adrese (mjesta stanovanja) studenata.<br/>
            Prvo potraži koje su sve sheme u bazi podataka sa upitom:<br/>
            <b>' UNION SELECT schema_name, null FROM information_schema.schemata--</b><br/>
            Ovdje vidi da postoji shema public i tada potraži koje se tablice nalaze u shemi:<br/>
            <b>' UNION SELECT table_name, null FROM information_schema.tables WHERE table_schema = 'public'--</b><br/>
            Vidi tablicu studenti i potraži koji sve stupci postoje:<br/>
            <b>' UNION SELECT column_name, null FROM information_schema.columns WHERE table_name = 'students'--</b><br/>
            Sada vidi sve stupce i primjerice želi pribaviti informacije o email adresama i mjestu stanovanja:<br/>
            <b>' UNION SELECT email, null FROM students--</b><br/>
            <b>' UNION SELECT address, null FROM students--</b><br/>
            I tako ostvaruje malo složeniji napad.<br/>
        </p>
        <label>
            Ranjivost
            <input
                type="checkbox"
                checked={vulnerable}
                onChange={() => setVulnerable(!vulnerable)}
            />
        </label>
        <form onSubmit={handleSubmit}>
            <input
                style={{width:"35vw"}}
                id="inputSQL"
                type="text"
                placeholder="JMBAG"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Submit</button>
        </form>
        {output ? output.map((item, index) => (
            <p key={index}>{JSON.stringify(item)}</p>
        )) : <></>}
        <p>{errMsg}</p>
    </div>
}

export default SqlAttack;