// backend/user-service/src/routes/user.js
import express from 'express';
import * as professionalController from '../controllers/professional.mjs';
import auth from '../middleware/auth.mjs';

const router = express.Router();


router.post('/create-profile', professionalController.createProfile);
router.get('/get-profile', professionalController.getProfile);
router.put('/update-profile', professionalController.updateProfile);
router.get('/search-professionals', professionalController.searchProfessionals);
router.get('/get-professional/:id', professionalController.getProfessionalById);
/* TODO: Add these routes/controllers/logic
router.post('/add-service', professionalController.addService);
router.put('/update-service/:id', professionalController.updateService);
router.delete('/delete-service/:id', professionalController.deleteService);
*/
export default router;
