import React, { useState } from "react";
import { Button } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import CheckIcon from "@material-ui/icons/Check";
import itemApi from "../../api/itemApi";
import "./index.scss";

function ItemCreate() {
  const [noti, setNoti] = useState("");
  const [error, setError] = useState({
    name: "",
    type: "",
    price: "",
    detail: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e.target);
    const {
      name,
      type,
      price,
      description,
      sale,
      saleExpiresTime,
      thumbnail,
    } = e.target;
    let formData = new FormData();
    formData.append("name", name.value);
    formData.append("type", type.value);
    formData.append("price", price.value);
    formData.append("description", description.value);
    formData.append("sale", sale.value);
    formData.append("saleExpiresTime", saleExpiresTime.value);
    formData.append("thumbnail", thumbnail.files[0]);

    itemApi
      .create(formData)
      .then((res) => {
        console.log(res);
        if (res && res.msg === "success") {
          console.log(res);
          setNoti("Create Item Successfully");
          return;
        }
        if (res && res.msg === "ValidatorError") {
          setError({
            ...error,
            name: res.errors.name ? "*" + res.errors.name : "",
            type: res.errors.type ? "*" + res.errors.type : "",
            price: res.errors.price ? "*" + res.errors.price : "",
            description: res.errors.description
              ? "*" + res.errors.description
              : "",
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleClearNotify = () => {
    setNoti("");
    setError({ ...error, name: "", type: "", price: "", detail: "" });
  };

  return (
    <>
      <form
        onChange={handleClearNotify}
        onSubmit={handleSubmit}
        className="items__create"
      >
        {noti && (
          <label className="items__notification">
            <CheckIcon />
            {noti}
          </label>
        )}
        <TextField
          label="Item Name"
          name="name"
          style={{ marginBottom: 22 }}
          placeholder="Placeholder"
          helperText={error.name}
          FormHelperTextProps={{
            style: { color: "red", fontStyle: "italic", fontSize: 10 },
          }}
          inputProps={{ style: { fontSize: 15 } }} // font size of input text
          InputLabelProps={{ style: { fontSize: 15 } }}
          fullWidth
        />
        <TextField
          label="Type"
          name="type"
          style={{ marginBottom: 22 }}
          placeholder="Placeholder"
          helperText={error.type}
          FormHelperTextProps={{
            style: { color: "red", fontStyle: "italic", fontSize: 10 },
          }}
          inputProps={{ style: { fontSize: 15 } }} // font size of input text
          InputLabelProps={{ style: { fontSize: 15 } }}
          fullWidth
        />
        <TextField
          label="Price"
          name="price"
          type="number"
          style={{ marginBottom: 20 }}
          placeholder="Placeholder"
          helperText={error.price}
          FormHelperTextProps={{
            style: { color: "red", fontStyle: "italic", fontSize: 10 },
          }}
          inputProps={{ style: { fontSize: 15 } }} // font size of input text
          InputLabelProps={{ style: { fontSize: 15 } }}
          fullWidth
        />
        <TextField
          label="Description"
          name="description"
          style={{ marginBottom: 20 }}
          helperText={error.description}
          FormHelperTextProps={{
            style: { color: "red", fontStyle: "italic", fontSize: 10 },
          }}
          inputProps={{ style: { fontSize: 15 } }} // font size of input text
          InputLabelProps={{ style: { fontSize: 15 } }}
          fullWidth
        />
        <TextField
          label="Sale (%)"
          name="sale"
          style={{ marginBottom: 20 }}
          helperText={error.sale}
          FormHelperTextProps={{
            style: { color: "red", fontStyle: "italic", fontSize: 10 },
          }}
          inputProps={{ style: { fontSize: 15 } }} // font size of input text
          InputLabelProps={{ style: { fontSize: 15 } }}
          fullWidth
        />
        <TextField
          label="Sale (%)"
          name="sale"
          style={{ marginBottom: 20 }}
          helperText={error.sale}
          FormHelperTextProps={{
            style: { color: "red", fontStyle: "italic", fontSize: 10 },
          }}
          inputProps={{ style: { fontSize: 15 } }} // font size of input text
          InputLabelProps={{ style: { fontSize: 15 } }}
          fullWidth
        />
        <TextField
          label="Sale Expired Time (ms)"
          name="saleExpiresTime"
          style={{ marginBottom: 20 }}
          helperText={error.saleExpiresTime}
          FormHelperTextProps={{
            style: { color: "red", fontStyle: "italic", fontSize: 10 },
          }}
          inputProps={{ style: { fontSize: 15 } }} // font size of input text
          InputLabelProps={{ style: { fontSize: 15 } }}
          fullWidth
        />
        <label className="blogs__label">
          Item Thumbnail (accepted: JPEG, JPG, PNG)
        </label>
        <input type="file" name="thumbnail" />{" "}
        <Button
          type="submit"
          className="blogs__submit"
          variant="contained"
          color="primary"
        >
          Create
        </Button>
      </form>
    </>
  );
}

export default ItemCreate;
