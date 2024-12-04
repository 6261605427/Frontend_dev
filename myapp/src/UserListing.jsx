import * as React from 'react';
import axios from 'axios'
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import toast from 'react-hot-toast';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useForm } from "react-hook-form";

const schema = yup.object().shape({
    userType: yup.string().required("User Type is required"),
    userRole: yup.string().required("User Role is required"),
    fullName: yup
        .string()
        .required("Full Name is required")
        .min(3, "Full Name must be at least 3 characters"),
    email: yup
        .string()
        .required("Email is required")
        .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Enter a valid email address"),
    status: yup.string().required("Status is required"),
});

const defaultValues = {
    userType: "",
    userRole: "",
    fullName: "",
    email: "",
    status: "",
};

export default function UserListing() {
    const [users, setUsers] = React.useState([])
    const [show, setShow] = useState('');
    // const [show2, setShow] = useState(falsse);
    const [id, setId] = useState('')


    const handleClose = () => setShow(false);
    const handleClose2 = () => setShow(false);
    const handleShow = () => setShow(true);

    const [formdata, setformdata] = React.useState({
        userType: "",
        userRole: "",
        fullName: "",
        email: "",
        status: ""
    })

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues,
    });
    const userType = watch("userType");

    const getAllUsers = async () => {
        try {
            const resp = await axios.get("http://localhost:5000/api/get-all-users");

            if (resp.status === 200) {
                console.log("Users fetched successfully:", resp.data.result);
                setUsers(resp.data.result);
            } else {
                console.error("Failed to fetch users. Status:", resp.status);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    React.useEffect(() => {
        getAllUsers()
    }, [])



    const handleEdit = async () => {
        try {
            const resp = await axios.put(`http://localhost:5000/api/update-user/${id}`, formdata);

            if (resp.status === 200) {
                getAllUsers();
                setShow(false);
                toast.success("User Updated Successfully");
            } else {
                toast.error(resp.data.message || "Something went wrong!");
            }
        } catch (error) {
            console.error("Error updating user:", error);

            if (error.response) {
                toast.error(error.response.data.message || "Server Error");
            } else if (error.request) {
                toast.error("No response from the server");
            } else {
                toast.error("Error in updating user");
            }
        }
    };


    const handleAdd = async (data) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/create-user`, data);

            if (response.status === 200) {
                toast.dismiss()
                toast.success(response.data.message || "User added successfully");
                getAllUsers();
                setShow(false);
            } else {
                toast.warning("Unexpected response from the server. Please try again.");
            }
        } catch (error) {
            if (error.response) {
                toast.dismiss()
                toast.error(error.response.data.message || "Failed to add user. Please try again.");
            } else {
                toast.dismiss()
                toast.error("An error occurred. Please check your network connection.");
            }

            console.error("Error adding user:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const resp = await axios.delete(`http://localhost:5000/api/delete-user/${id}`);

            if (resp.status === 200) {
                getAllUsers();
                setShow(false);
                toast.success("User Deleted Successfully");
            } else {
                toast.error(resp.data.message || "Something went wrong!");
            }
        } catch (error) {
            console.error("Error deleting user:", error);

            if (error.response) {
                toast.error(error.response.data.message || "Server Error");

            } else {
                toast.error("Error in deleting user");
            }
        }
    };







    const handleEditUser = (item, type) => {
        setId(item?.id)
        setShow(type)
        setformdata({
            userType: item?.userType,
            userRole: item?.userRole,
            fullName: item?.fullName,
            email: item?.email,
            status: item?.status
        })
    }

    React.useEffect(() => {
        if (formdata?.userType === "Admin") {
            setformdata({ ...formdata, userRole: "Administrator" })
        } else {
            setformdata({ ...formdata, userRole: "" })
        }
    }, [formdata?.userType])


    return (
        <div style={{
            padding: "50px",
        }}>
            <div className='d-flex justify-content-between'>
                <h3 className='d-flex gap-2'>Users

                </h3>


                <button className='btn btn-success' onClick={() => handleEditUser('', "add")}>Add User</button>
            </div>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th scope="col">Emp Id</th>
                        <th scope="col">Full Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">User Type</th>
                        <th scope="col">User Role</th>
                        <th scope="col">Status</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users && users.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <td>{item?.id}</td>
                                    <td>{item?.fullName}</td>
                                    <td>{item?.email}</td>
                                    <td>{item?.userType}</td>
                                    <td>{item?.userRole}</td>
                                    <td style={{ color: item?.status === "active" ? "green" : "red" }}>
                                        {item?.status === "active" ? "Active" : "Inactive"}
                                    </td>

                                    <td>

                                        <button className='btn btn-outline-success  mr-1 me-2' onClick={() => handleEditUser(item, "edit")}>Edit</button>
                                        <button className='btn btn-outline-danger' onClick={() => handleDelete(item?.id)}>Delete</button>
                                        <Modal show={show === "edit"} onHide={handleClose}>
                                            <Modal.Header closeButton>
                                                <Modal.Title>Edit User</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                <Form>
                                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                                        <Form.Label>User Type</Form.Label>
                                                        <Form.Select aria-label="Default select example" onChange={(e) => {
                                                            setformdata({ ...formdata, userType: e.target.value })
                                                        }}
                                                            value={formdata?.userType}
                                                        >
                                                            <option value="Admin">Admin</option>
                                                            <option value="General">General</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                                        <Form.Label>User Role</Form.Label>
                                                        <Form.Select aria-label="Default select example" onChange={(e) => {
                                                            setformdata({ ...formdata, userRole: e.target.value })
                                                        }}
                                                            disabled={formdata?.userType === "Admin"}
                                                            value={formdata?.userRole || ''}
                                                        >
                                                            {
                                                                formdata?.userType === "Admin" ? (
                                                                    <option value="Administrator">Administrator</option>
                                                                ) :
                                                                    (
                                                                        <>
                                                                            <option value="">Select</option>
                                                                            <option value="Developer">Developer</option>
                                                                            <option value="Designer">Designer</option>
                                                                        </>

                                                                    )
                                                            }

                                                        </Form.Select>
                                                    </Form.Group>
                                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                                        <Form.Label>Full Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Ex. Anupam Rai"
                                                            autoFocus
                                                            value={formdata?.fullName}
                                                            onChange={(e) => setformdata({ ...formdata, fullName: e.target.value })}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                                        <Form.Label>Email address</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            placeholder="name@example.com"
                                                            autoFocus
                                                            value={formdata?.email}
                                                            disabled={formdata?.userType === "Admin" || formdata?.userType === "General"}
                                                            onChange={(e) => setformdata({ ...formdata, email: e.target.value })}
                                                        />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                                        <Form.Label>Status</Form.Label>
                                                        <Form.Select aria-label="Default select example" onChange={(e) => {
                                                            setformdata({ ...formdata, status: e.target.value })
                                                        }}
                                                            value={formdata?.status}
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Form>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button variant="secondary" onClick={handleClose}>
                                                    Close
                                                </Button>
                                                <Button variant="primary" onClick={() => handleEdit(item?.id)}>
                                                    Save Changes
                                                </Button>
                                            </Modal.Footer>
                                        </Modal>
                                    </td>
                                </tr>
                            )
                        })
                    }

                </tbody>
            </table>

            <Modal show={show === "add"} onHide={handleClose2}>
                <Modal.Header closeButton>
                    <Modal.Title>Add User</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit(handleAdd)}>
                    <Modal.Body>
                        {/* User Type */}
                        <Form.Group className="mb-3" controlId="userType">
                            <Form.Label>User Type</Form.Label>
                            <Form.Select {...register("userType")}>
                                <option value="">Select User Type</option>
                                <option value="Admin">Admin</option>
                                <option value="General">General</option>
                            </Form.Select>
                            {errors.userType && <span className="text-danger">{errors.userType.message}</span>}
                        </Form.Group>

                        {/* User Role */}
                        <Form.Group className="mb-3" controlId="userRole">
                            <Form.Label>User Role</Form.Label>
                            <Form.Select {...register("userRole")}>
                                {userType === "Admin" ? (
                                    <>
                                        <option value="">Select</option>
                                        <option value="Administrator">Administrator</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="">Select</option>
                                        <option value="Developer">Developer</option>
                                        <option value="Designer">Designer</option>
                                    </>
                                )}
                            </Form.Select>
                            {errors.userRole && <span className="text-danger">{errors.userRole.message}</span>}
                        </Form.Group>

                        {/* Full Name */}
                        <Form.Group className="mb-3" controlId="fullName">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ex. Anupam Rai"
                                {...register("fullName")}
                            />
                            {errors.fullName && <span className="text-danger">{errors.fullName.message}</span>}
                        </Form.Group>

                        {/* Email Address */}
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="name@example.com"
                                {...register("email")}
                            />
                            {errors.email && <span className="text-danger">{errors.email.message}</span>}
                        </Form.Group>

                        {/* Status */}
                        <Form.Group className="mb-3" controlId="status">
                            <Form.Label>Status</Form.Label>
                            <Form.Select {...register("status")}>
                                <option value="">Select Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </Form.Select>
                            {errors.status && <span className="text-danger">{errors.status.message}</span>}
                        </Form.Group>


                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                        <Button variant="secondary" onClick={() => setShow(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div >
    );
}

