const { Router } = require('express')

const router = Router()

router.use('/businesses', require('./businesses'))
router.use('/photos', require('./photos'))
router.use('/images', require('./images'))

module.exports = router
