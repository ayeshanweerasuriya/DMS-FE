const Patient = require("../models/dental/Patient.js");

const addPatient = async (req, res) => {
    try {
        const { name, age, illnessType, contactNumber, dateOfBirth, notes } = req.body;

        // Validate required fields
        if (!name || !age || !illnessType || !contactNumber || !dateOfBirth) {
            return res.status(400).json({ message: "All required fields must be provided." });
        }

        // Validate name length
        if (name.length > 100) {
            return res.status(400).json({ message: "Patient name must be at most 100 characters." });
        }

        // Validate age
        if (!Number.isInteger(age) || age < 0 || age > 150) {
            return res.status(400).json({ message: "Patient age must be a valid number between 0 and 150." });
        }

        // Validate illness type length
        if (illnessType.length > 200) {
            return res.status(400).json({ message: "Illness type must be at most 200 characters." });
        }

        // Validate contact number
        if (!/^[0-9]{1,15}$/.test(contactNumber)) {
            return res.status(400).json({ message: "Contact number must be numeric and at most 15 digits." });
        }

        // Validate date of birth
        const dob = new Date(dateOfBirth);
        const today = new Date();
        if (isNaN(dob.getTime()) || dob >= today) {
            return res.status(400).json({ message: "Date of birth cannot be today or a future date." });
        }

        // Validate notes length
        if (notes && notes.length > 2500) {
            return res.status(400).json({ message: "Patient notes must be at most 2500 characters." });
        }

        // Create new patient
        const newPatient = new Patient({
            name,
            age,
            illnessType,
            contactNumber,
            dateOfBirth,
            notes,
        });

        await newPatient.save();
        return res.status(201).json({ message: "Patient added successfully", patient: newPatient });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate date of birth if being updated
        if (updates.dateOfBirth) {
            const dob = new Date(updates.dateOfBirth);
            if (dob >= new Date()) {
                return res.status(400).json({ message: "Date of birth cannot be today or a future date." });
            }
        }

        const updatedPatient = await Patient.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!updatedPatient) {
            return res.status(404).json({ message: "Patient not found." });
        }

        res.status(200).json({ message: "Patient updated successfully", patient: updatedPatient });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deletePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPatient = await Patient.findByIdAndDelete(id);

        if (!deletedPatient) {
            return res.status(404).json({ message: "Patient not found." });
        }

        res.status(200).json({ message: "Patient deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    addPatient,
    updatePatient,
    deletePatient
  };