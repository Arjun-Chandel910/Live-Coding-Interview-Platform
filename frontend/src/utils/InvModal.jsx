import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import axios from "axios";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const InvModal = ({ sendInvite, roomId }) => {
  const [open, setOpen] = React.useState(false);
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [senderName, setSenderName] = React.useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSendInvite = () => {
    // Example placeholder for the invite sending logic
    sendInvite(recipientEmail, roomId, senderName);

    // Add your API call here
    // await axios.post('/api/send-invite', { recipientEmail, senderName })

    handleClose(); // Close modal after sending
  };

  return (
    <div>
      <Button onClick={handleOpen}>Invite</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="invite-modal-title"
        aria-describedby="invite-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="invite-modal-title"
            variant="h6"
            component="h2"
            gutterBottom
          >
            Send Meeting Invite
          </Typography>

          <TextField
            label="Recipient Email"
            type="email"
            fullWidth
            variant="outlined"
            margin="normal"
            required
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />

          <TextField
            required
            label="Your Name"
            fullWidth
            variant="outlined"
            margin="normal"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSendInvite}
            sx={{ mt: 2 }}
            fullWidth
          >
            Send Invite
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default InvModal;
