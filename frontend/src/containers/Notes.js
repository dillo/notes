import React, { useRef, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import Form from "react-bootstrap/Form";

import { API, Storage } from "aws-amplify";

import config from "../config";

import { onError } from "../lib/errorLib";
import { s3Upload } from "../lib/awsLib";

import LoaderButton from "../components/LoaderButton";

import "./css/Notes.css";

const Notes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const file = useRef(null);
  const { id } = useParams();
  const history = useHistory();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    onLoad();
  }, [id]);

  const loadNote = () => {
    return API.get("notes", `/notes/${id}`);
  }

  const onLoad = async () => {
    try {
      const note = await loadNote();
      const { content, attachment } = note;

      if (attachment) {
        note.attachmentURL = await Storage.vault.get(attachment);
      }

      setContent(content);
      setNote(note);
    } catch (e) {
      onError(e);
    }
  }

  const validateForm = () => {
    return content.length > 0;
  }

  const formatFilename = (str) => {
    return str.replace(/^\w+-/, "");
  }

  const handleFileChange = (event) => {
    file.current = event.target.files[0];
  }

  const saveNote = (note) => {
    return API.put("notes", `/notes/${id}`, {
      body: note
    });
  }

  const handleSubmit = async (event) => {
    let attachment;

    event.preventDefault();

    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${
          config.MAX_ATTACHMENT_SIZE / 1000000
        } MB.`
      );
      return;
    }
    setIsLoading(true);

    try {
      if (file.current) {
        attachment = await s3Upload(file.current);
      }

      await saveNote({
        content,
        attachment: attachment || note.attachment
      });
      history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  const deleteNote = () => {
    return API.del("notes", `/notes/${id}`);
  }

  const handleDelete = async (event) => {
    event.preventDefault();

    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }
    setIsDeleting(true);

    try {
      await deleteNote();
      history.push("/");
    } catch (e) {
      onError(e);
      setIsDeleting(false);
    }
  }

  return (
    <div className="Notes">
      {note && (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="content">
            <Form.Control
              as="textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="file">
            <Form.Label>Attachment</Form.Label>
            {note.attachment && (
              <p>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={note.attachmentURL}
                >
                  {formatFilename(note.attachment)}
                </a>
              </p>
            )}
            <Form.Control onChange={handleFileChange} type="file" />
          </Form.Group>
          <LoaderButton
            block
            size="lg"
            type="submit"
            isLoading={isLoading}
            disabled={!validateForm()}
          >
            Save
          </LoaderButton>
          <LoaderButton
            block
            size="lg"
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete
          </LoaderButton>
        </Form>
      )}
    </div>
  );
}

export default Notes;
