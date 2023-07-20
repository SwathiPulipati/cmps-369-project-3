const express = require('express')
const router = express.Router();

const logged_in = (req, res, next) => {
    if(req.session.user){
        next();
    }
    else{
        res.status(401).send('Not authorized');
    }
}

const first_open =  async (req, res, next) => {
    const user = await req.db.findUserByUsername('cmps369');
    if(!user)
        await req.db.addDefaultData();
    next();
}

router.get('/', first_open, async (req, res) => {
    const contacts = await req.db.findContacts();
    res.render('home', {contacts: contacts});
})

router.get('/create', async (req, res) => {
    res.render('create', {info: {
        first: '',
        last: '',
        phone: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
    }});
})

router.post('/create', async (req, res) => {
    console.log(req.body);
    for (let prop in req.body){
        if(req.body[prop].trim() === ''){
            res.render('create', {show_valid: true, info: req.body})
            return;
        }
    }
    const id = await req.db.createContact(req.body)
    res.redirect('/')
})

router.get('/:id', async (req, res) => {
    if (!isNaN(req.params.id)){
        const contact = await req.db.findSingleContact(req.params.id);
        res.render('info', {c: contact}); 
    }
})

router.get('/:id/edit', logged_in, async (req, res) => {
    if (!isNaN(req.params.id)){
        const contact = await req.db.findSingleContact(req.params.id);
        console.log(contact)
        res.render('edit', {c: contact, show_valid: false}); 
    }
})

router.post('/:id/edit', async (req, res) => {
    for (let prop in req.body){
        if(req.body[prop].trim() === ''){
            res.render('edit', {show_valid: true, c: req.body})
            return;
        }
    }
    await req.db.editContact(req.params.id, req.body);
    res.redirect('/'+req.params.id); 
})

router.post('/:id/delete', async (req, res) => {
    await req.db.deleteContact(req.params.id);
    res.redirect('/')
})

module.exports = router;
