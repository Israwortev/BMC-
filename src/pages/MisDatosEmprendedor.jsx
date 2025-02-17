import React from 'react'
//import PageLoading from '../Components/PageLoading'
import { Link, withRouter } from 'react-router-dom'
import '../Components/styles/MisDatosEmprendedor.css'
import { connect } from 'react-redux'
import axios from 'axios'
import pp from '../images/icons-sidebar/pp.svg'
import wa from '../images/wait.gif'
import camara from '../images/camera.svg'
import { urlsApi } from '../Services/Constantes';

class MisDatosEmprendedor extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            photo: (localStorage.getItem('firstReg') === "true") ? pp : wa,
            nickname: props.userName,
            correo: props.userEmail,
            nombre: '',
            apellidop: '',
            apellidom: '',
            pais: '',
            ciudad: '',
            fecha_nacimiento:'',
            fechaD: '',
            fechaM: '',
            fechaA: '',
            changePass: false,
            proy_descripcion: '',
            id_usuario: props.user,
            ID: localStorage.getItem('userID'),
            firstReg: localStorage.getItem('firstReg'),
            firstReg2: false,
            country: {countries: []},
            cityId:'',
            loading: false,
            citi:{data: []},
            oldPass: '',
            newPass:'',
            confirmPass:'',
            mencamCon:'',
        }       
    }

    async componentDidMount() {
        await axios({
            url: `${urlsApi.leerpaises}`,
            method: 'GET',
        })
        .then(response =>{
            var objson = JSON.parse(response.data);
            this.setState({
                country: objson,
            })
        })
        .catch(error => {
            console.log(error)
            return error;
        });

        if(this.state.firstReg === "false"){
            this.setState({firstReg2: false});
             await axios({
                url: `${urlsApi.datosperfil}`+this.state.ID,
                method: 'GET',
                headers:{
                'Authorization': 'Bearer ' + urlsApi.token
                }
            })
            .then(response =>{
                if(response.data.success){
                    var jsonres = JSON.parse(response.data.data);
                    this.setState({
                        nickname: jsonres.nickname,
                        correo: jsonres.correo,
                        nombre: jsonres.nombre,
                        apellidop: jsonres.apellidop,
                        apellidom: jsonres.apellidom,
                        proy_descripcion: jsonres.proy_descripcion,
                        pais: jsonres.pais,
                        ciudad: jsonres.ciudad,
                        fecha_nacimiento: jsonres.fecha_nacimiento,
                        fechaD: jsonres.fecha_nacimiento.substr(8,10),
                        fechaM: jsonres.fecha_nacimiento.substr(5,2),
                        fechaA: jsonres.fecha_nacimiento.substr(0,4),
                        photo: (jsonres.urlprofilephoto.length == 0) ? pp : jsonres.urlprofilephoto,
                    })
                    this.handleChangeCity(this.state.pais);
                }
                else{
                    
                    console.log(response);
                }
            })
            .catch(error => {
                console.log(error)
                return error;
            })
            await axios({
                url: `${urlsApi.leerpaisesNiv2}`+this.state.pais,
                method: 'GET',
            })
            .then(response =>{
                this.setState({
                    citi: response,
                })
            })
            .catch(error => {
                console.log(error)
                return error;
            })
        }
        else{
            this.setState({firstReg2: true});
        }
       
    }
    handleChangeCity = (event) => {
        this.setState({cityId: event, pais:event}, () => {
             axios({
                url: `${urlsApi.leerpaisesNiv2}`+this.state.cityId,
                method: 'GET',
            })
            .then(response =>{
                this.setState({
                    citi: response,
                })
            })
            .catch(error => {
                console.log(error)
                return error;
            })
        });
    }
    handleRegPerf = async e => {
        this.setState({loading: true});
        e.preventDefault(); 
        const data = {
            id_usuario: this.state.ID,
            estado: '',
            nombre: this.state.nombre,
            apellidop: this.state.apellidop,
            apellidom: this.state.apellidom,
            nickname: this.state.nickname,
            fecha_nacimiento: this.state.fechaA+'/'+this.state.fechaM+'/'+this.state.fechaD,
            sexo: '',
            direccion: '',
            codigo_postal: '',
            facebook:'',
            twitter:'',
            instagram:'',
            youtube:'',
            linkedin:'',
            biografia:'',
            fecha_ultimo_ingreso:'',
            pais: this.state.pais,
            ciudad: this.state.ciudad,
            proy_descripcion: this.state.proy_descripcion,
            giro:'',
            empleados:'',
            no_Empleados:'',
            tipo_interes:'',
        }
        await axios ({
            url:  `${urlsApi.actualizarperfil}`,
            method: 'POST',
            data: data,
            headers:{
                'Authorization': 'Bearer ' + urlsApi.token
            }
        })
        .then(response => {
            if(response.data.success === true){
                if(this.state.firstReg === "true"){
                    localStorage.setItem('firstReg', false);
                }
                window.location="/";
            }
            else{
                if(response.data.success === false && response.data.status === "200" && response.data.message === "No se pudo actualizar el perfil"){
                    window.location="/";
                }
                else{
                    console.log(response);
                }
            }
        }).catch(error => {
            this.setState({loading: false, error: error})
        })
    }
    handleChange = e => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    handleChangeImg = async e => {
        this.setState({
            photo: wa,
        })
        var filedata = new FormData();
        filedata.append('photo', e.target.files[0]);
        filedata.append('idUsuario', this.state.ID);
         await axios({
             url: `${urlsApi.cargarphoto}`,
             method: 'POST',
             data: filedata,
             headers:{
                'Authorization': 'Bearer ' + urlsApi.token,
                 'Content-Type': 'multipart/form-data',
             }
         })
         .then(response =>{
            if(response.data.success == true){
                this.setState({
                    photo: response.data.url,
                })
            }
         })
         .catch(error => {
             console.log(error)
             return error;
        })
    }

    handleChangeContra = async e => {
        const data = {
            id_usuario: this.state.ID,
            contrasenia_anterior: this.state.oldPass,
            contrasenia: this.state.newPass,
            confirmacion_contrasenia: this.state.confirmPass,
        }
        this.setState({
            mencamCon: 'Solicitando...', 
        })
        await axios({
            url: `${urlsApi.actualizarusuario}`,
            method: 'POST',
            data: data,
            headers:{
               'Authorization': 'Bearer ' + urlsApi.token,
            }
        })
        .then(response =>{
                this.setState({
                    mencamCon: response.data.message,
                })
        })
        .catch(error => {
            this.setState({
                mencamCon: 'Ocurrió un error, intentalo más tarde.',
            })
            console.log(error)
            return error;
       })
    }

    handleChangePass = e => {
        this.setState({changePass: !this.state.changePass})
    }

    handleCancel = e => {
        window.location="/";
    }

    render(){
        return <React.Fragment>
        {/* Backgroun image */}
        <div className="bg">
<div className="container-fluid">
            <div className="row">
                <div className="col-12 fluid imagen"> 
                </div>
            </div>
        </div>
        {/* Card */}
        <div className="container-xlg card">
            <div className="row">
                <p style={{textAlign: 'end'}}><span onClick={this.handleCancel} className="btn-close-data">x</span></p> 
                <div className="col-12 pp">
                    <div className="avatar">
                            <img className="input_image profile-picture" src={this.state.photo} alt="imagen"/>
                            <p className="hint_size">*Máximo 3MB</p>
                            <label className="subir-foto" htmlFor="photo"><img src={camara} alt="" /></label>
                            <input className="input_link" id="photo" type="file" name="photo" accept="image/*" onChange={this.handleChangeImg}/>
                    </div>
                    <h4 className="profile_name">{this.state.nickname}</h4>
                </div>
                <div className="col-12">
                    <h4 className="instruccion">Completa tu información</h4> 
                </div> 
                <div className="col-md-6 text_center " >
                    <p className="titulop">Nombre de usuario:</p>
                    <div className="">
                        <input 
                        onChange={this.handleChange} 
                        type="text" 
                        className="field-container-form text_center"
                        name="nickname"
                        value={this.state.nickname}/>
                    </div>
                </div>
                <div className="col-md-6 text_center ">
                    <p className="titulop">Correo:</p>
                    <div className="">
                        <input
                        onChange={this.handleChange} 
                        type="email" 
                        className="field-container-form text_center"
                        name="correo"
                        value={this.state.correo} disabled/> 
                    </div>
                </div>
                <div className="col-md-6 text_center ">
                <p className="titulop">Fecha de nacimiento:</p>
                    <fieldset className="cart_label uppercase semibold"/> 
                    <select id="day" name="fechaD" className="select_day cart_select italic semibold" onChange={this.handleChange} value={this.state.fechaD}> 
                        <option value="" hidden >Día</option>
                        <option value="01">1</option> 
                        <option value="02">2</option> 
                        <option value="03">3</option> 
                        <option value="04">4</option> 
                        <option value="05">5</option> 
                        <option value="06">6</option> 
                        <option value="07">7</option> 
                        <option value="08">8</option> 
                        <option value="09">9</option> 
                        <option value="10">10</option> 
                        <option value="11">11</option> 
                        <option value="12">12</option> 
                        <option value="13">13</option> 
                        <option value="14">14</option> 
                        <option value="15">15</option> 
                        <option value="16">16</option> 
                        <option value="17">17</option> 
                        <option value="18">18</option> 
                        <option value="19">19</option> 
                        <option value="20">20</option> 
                        <option value="21">21</option> 
                        <option value="22">22</option> 
                        <option value="23">23</option> 
                        <option value="24">24</option> 
                        <option value="25">25</option> 
                        <option value="26">26</option> 
                        <option value="27">27</option> 
                        <option value="28">28</option> 
                        <option value="29">29</option> 
                        <option value="30">30</option> 
                        <option value="31">31</option> 
                    </select>
                    <select id="month" name="fechaM" className="select_month cart_select italic light" onChange={this.handleChange} value={this.state.fechaM}>
                        <option value="" hidden>Mes</option> 
                        <option value="01">Enero</option> 
                        <option value="02">Febrero</option> 
                        <option value="03">Marzo</option> 
                        <option value="04">Abril</option> 
                        <option value="05">Mayo</option> 
                        <option value="06">Junio</option> 
                        <option value="07">Julio</option> 
                        <option value="08">Agosto</option> 
                        <option value="09">Septiembre</option> 
                        <option value="10">Octubre</option> 
                        <option value="11">Noviembre</option> 
                        <option value="12">Diciembre</option> 
                    </select>
                    <select id="year" name="fechaA" className="select_year cart_select italic light" onChange={this.handleChange} value={this.state.fechaA}>
                        <option value="" hidden>Año</option> 
                        <option value="2018">2018</option> 
                        <option value="2017">2017</option> 
                        <option value="2016">2016</option> 
                        <option value="2015">2015</option> 
                        <option value="2014">2014</option> 
                        <option value="2013">2013</option> 
                        <option value="2012">2012</option> 
                        <option value="2011">2011</option> 
                        <option value="2010">2010</option> 
                        <option value="2009">2009</option>
                        <option value="2008">2008</option>
                        <option value="2007">2007</option>
                        <option value="2006">2006</option>
                        <option value="2005">2005</option>
                        <option value="2004">2004</option>
                        <option value="2003">2003</option>
                        <option value="2002">2002</option>
                        <option value="2001">2001</option>
                        <option value="2000">2000</option>
                        <option value="1999">1999</option>
                        <option value="1998">1998</option>
                        <option value="1997">1997</option>
                        <option value="1996">1996</option>
                        <option value="1995">1995</option>
                        <option value="1994">1994</option>
                        <option value="1993">1993</option>
                        <option value="1992">1992</option>
                        <option value="1991">1991</option>
                        <option value="1990">1990</option>
                        <option value="1989">1989</option>
                        <option value="1988">1988</option>
                        <option value="1987">1987</option>
                        <option value="1986">1986</option>
                        <option value="1985">1985</option>
                        <option value="1984">1984</option>
                        <option value="1983">1983</option>
                        <option value="1982">1982</option>
                        <option value="1981">1981</option>
                        <option value="1980">1980</option>
                        <option value="1979">1979</option>
                        <option value="1978">1978</option>
                        <option value="1977">1977</option>
                        <option value="1976">1976</option>
                        <option value="1975">1975</option>
                        <option value="1974">1974</option>
                        <option value="1973">1973</option>
                        <option value="1972">1972</option>
                        <option value="1971">1971</option>
                        <option value="1970">1970</option>
                        <option value="1969">1969</option>
                        <option value="1968">1968</option>
                        <option value="1967">1967</option>
                        <option value="1966">1966</option>
                        <option value="1965">1965</option>
                        <option value="1964">1964</option>
                        <option value="1963">1963</option>
                        <option value="1962">1962</option>
                        <option value="1961">1961</option>
                        <option value="1960">1960</option>
                        <option value="1959">1959</option>
                        <option value="1958">1958</option>
                        <option value="1957">1957</option>
                        <option value="1956">1956</option>
                        <option value="1955">1955</option>
                        <option value="1954">1954</option>
                        <option value="1953">1953</option>
                        <option value="1952">1952</option>
                        <option value="1951">1951</option>
                        <option value="1950">1950</option>
                        <option value="1949">1949</option>
                        <option value="1948">1948</option>
                        <option value="1947">1947</option>
                        <option value="1946">1946</option>
                        <option value="1945">1945</option>
                        <option value="1944">1944</option>
                        <option value="1943">1943</option>
                        <option value="1942">1942</option>
                        <option value="1941">1941</option>
                        <option value="1940">1940</option>
                        <option value="1939">1939</option>
                        <option value="1938">1938</option>
                        <option value="1937">1937</option>
                        <option value="1936">1936</option>
                        <option value="1935">1935</option>
                        <option value="1934">1934</option>
                        <option value="1933">1933</option>
                        <option value="1932">1932</option>
                        <option value="1931">1931</option>
                        <option value="1930">1930</option>
                    </select> 
                </div>

                <div className="col-md-6 text_center ">
                    <p className="titulop">Nombre:</p>
                    <div className="">
                        <input 
                        onChange={this.handleChange}
                        type="text" 
                        className="field-container-form text_center"
                        name="nombre"
                        value={this.state.nombre}/> 
                    </div>
                </div>
                <div className="col-md-6 text_center ">
                <p className="titulop">Apellido Paterno:</p>
                    <div className="">
                        <input 
                        onChange={this.handleChange}
                        type="text" 
                        className="field-container-form text_center"
                        name="apellidop"
                        value={this.state.apellidop}/> 
                    </div>  
                </div>
                <div className="col-md-6 text_center ">
                <p className="titulop">Apellido Materno:</p>
                    <div className="">
                        <input 
                        onChange={this.handleChange}
                        type="text" 
                        className="field-container-form text_center"
                        name="apellidom"
                        value={this.state.apellidom}/> 
                    </div>  
                </div>

                <div className="col-md-6 text_center ">
                    <p className="titulop">Giro o Industria</p>
                        <select name="giro" className="field-container-form text_center" style={{textAlignLast: 'center'}} >
                            <option value="Automotriz">Automotriz</option>
                            <option value="Alimentos y bebidas">Alimentos y bebidas</option>
                            <option value="Comercio especializado">Comercio especializado</option>
                            <option value="Cuidado personal">Cuidado personal</option>
                            <option value="Educación, capacitación y coaching">Eduación, capacitación, coaching</option>
                            <option value="Entretenimiento, recreación y eventos">Entretenimiento, recreación y eventos</option>
                            <option value="Salud y bienestar">Salud y bienestar</option>
                            <option value="Servicios especializados">Servicios especializados</option>
                            <option value="Tecnologías de la Información">Tecnologías de la Información</option>
                            <option value="Turismo">Turismo</option>
                        </select>
                    {!this.state.firstReg2 ? <React.Fragment>



                        <div className="btn-espacio-arriba">
                            <button onClick={this.handleChangePass} className="btn-danger btn-m btnsave"> Cambiar contraseña</button>
                        </div>

                        
                    
                      

        

                        {this.state.changePass ?                         <div className="text-center"> 
                            <label htmlFor="oldPass">Contraseña antigua: </label>   
                            <div>
                                <input className="field-container-form text_center" onChange={this.handleChange} type="password" name="oldPass" id="oldPass"/>
                            </div>            
                            <label htmlFor="newPass">Nueva contraseña: </label>
                            <div>
                                <input className="field-container-form text_center" onChange={this.handleChange} type="password" name="newPass" id="newPass"/>
                            </div>                                       
                            <label htmlFor="text_center confirmPass">Confirmar nueva contraseña: </label>
                            <div style={{marginBottom: '-30px'}}>
                                <input className="field-container-form text_center" onChange={this.handleChange} type="password" name="confirmPass" id="confirmPass"/>
                            </div>   
                            <p style={{color: 'red', padding:'1em'}}>{this.state.mencamCon}</p>
                            <button onClick={this.handleChangeContra} className=" btn-danger btn-m btnsave"> Cambiar contraseña </button>
                        </div> : null}
                </React.Fragment>: null}
                </div>


                <div className="col-md-6 text_center ">
                    <p className="titulop">País de Residencia:</p>
                    <select name="pais" className="field-container-form text_center" style={{textAlignLast: 'center'}} onChange={(val) =>  this.handleChangeCity(val.target.value)} value={this.state.pais}>
                        <option className="text_center"></option>
                        {this.state.country.countries.map(function(d){
                            return(
                                <option className="text_center" key={d.id} value={d.id}>{d.name}</option>
                            )
                        })}
                    </select> 
                    <br>
                    </br>
                    <p className="titulop" style={{marginTop: '1em'}}>Ciudad de Residencia:</p>
                <select name="ciudad" className="field-container-form text_center" style={{textAlignLast: 'center'}} onChange={this.handleChange} value={this.state.ciudad}>
                        {this.state.citi.data.map(function(d){
                            if(d.id){
                                return(
                                    <option className="text_center" key={d.id} value={d.id}>{d.name}</option>
                                )
                            }
                        })}
                    </select>
                 
                </div>
                <div className="col-12 info2">
                    <h4 className="instruccion2">¿Cómo te enteraste de esta herramienta?</h4>
                    <textarea
                    type="text" 
                    className="field-container2" 
                    onChange={this.handleChange}
                    name="proy_descripcion"
                    maxLength="200"
                    value={this.state.proy_descripcion}/> 
                    <p className="instruccion3 ">Máximo 200 caracteres</p>
                </div>
                
            </div>
            <div className="row colum"> 
            {/* save btn */}
                <div className="col-sm-8">
                    <button onClick={this.handleCancel} className="btncancel btn-lg btn-danger"> 
                    Omitir
                    </button>
                </div>
                <div className="col-sm-2">
                    <button onClick={this.handleRegPerf} className="btn-danger btn-lg btnsave"> 
                    Guardar
                    </button>
                </div>
            </div>




        


        </div>

        </div>
    
        </React.Fragment>
    }
}

const mapStateToProps = state => {
    return{
        loginState: state.loginState,
        userName: state.userName,
        userID: state.userID,
        userEmail: state.userEmail,
    }
}

export default withRouter(connect(mapStateToProps, null)(MisDatosEmprendedor));
 