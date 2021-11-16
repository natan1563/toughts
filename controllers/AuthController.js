const User = require('../models/User')
const bcrypt = require('bcryptjs')

module.exports = class AuthController {
  static login(req, res) {
    res.render('auth/login')
  }

  static async loginPost(req, res) {
    const {email, password} = req.body

    // find user validation
    const user = await User.findOne({where: {email}})

    if (!user) {
      req.flash('message', 'Usuário não encontrado')
      res.render('auth/login')
      return
    }

    // check if password match
    const passwordMatch = bcrypt.compareSync(password, user.password)

    if (!passwordMatch) {
      req.flash('message', 'Senha inválida')
      res.render('auth/login')
      return
    }

    try {
      const createdUser = await User.create(user)

      req.session.userid = user.id

      req.session.save(() => {
        res.redirect('/')
      })
    } catch(err) {
      console.log(err)
    }
  }

  static register(req, res) {
    res.render('auth/register')
  }

  static async registerPost(req, res) {
    const {name, email, password, passwordConfirm} = req.body 

    // password match validation 
    if (password != passwordConfirm) {
      req.flash('message', 'As senhas não conferem, tente novamente!')
      res.render('auth/register')
      return
    }

    const checkIfUserExists = await User.findOne({where: {email}})

    if (checkIfUserExists) {
      req.flash('message', 'O E-mail já está em uso')
      res.render('auth/register')
      return
    }

    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)

    const user = {
      name,
      email,
      password: hashedPassword
    }

    try {
      const createdUser = await User.create(user)

      req.session.userid = createdUser.id
      
      req.flash('message', 'Cadastro realizado com sucesso')

      req.session.save(() => {
        res.redirect('/')
      })
    } catch(err) {
      console.log(err)
    }
  }

  static logout(req, res) {
    req.session.destroy()
    res.redirect('/login')
  }
}