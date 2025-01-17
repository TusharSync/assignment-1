import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';
import { useParams } from 'react-router-dom';

const EmailThreadPage: React.FC = () => {
  const { emailThread, selectOffer } = useOfferStore();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) selectOffer(id);
  }, [id, selectOffer]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Email Thread
      </Typography>
      <List>
        {emailThread.map((email) => (
          <ListItem key={email.messageId}>
            <ListItemText
              primary={`Subject: ${email.subject}`}
              secondary={`Body: ${email.body}`}
            />
            <List>
              {email.replies.map((reply: any) => (
                <ListItem key={reply.messageId} sx={{ paddingLeft: 4 }}>
                  <ListItemText
                    primary={`From: ${reply.from}`}
                    secondary={`Reply: ${reply.body}`}
                  />
                </ListItem>
              ))}
            </List>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default EmailThreadPage;
