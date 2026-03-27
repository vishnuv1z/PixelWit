import API from "./api";

export const createRequest       = (data)        => API.post("/requests", data);
export const listClientRequests  = (clientId)    => API.get(`/requests/client/${clientId}`);
export const getEditorRequests   = (editorId)    => API.get(`/requests/editor/${editorId}`);
export const getRequest          = (id)          => API.get(`/requests/${id}`);
export const updateRequestStatus = (id, data)    => API.put(`/requests/${id}`, data);
export const editRequest         = (id, data)    => API.patch(`/requests/${id}/edit`, data);
export const deleteRequest       = (id)          => API.delete(`/requests/${id}`);
export const getUploadSignature  = ()            => API.get("/upload/sign");
export const saveDeliverable     = (reqId, data) => API.post(`/requests/${reqId}/deliverables`, data);
export const getDeliverables     = (reqId)       => API.get(`/requests/${reqId}/deliverables`);

// Reviews — separate collection
export const submitReview      = (data)      => API.post("/reviews", data);
export const getEditorReviews  = (editorId)  => API.get(`/reviews/editor/${editorId}`);