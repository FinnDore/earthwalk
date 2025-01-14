//! Temporary library for easier binary encoding/decoding.
//!
//! Eventually these will be deprecated by macros but I can't find one which supports large payloads (basically it needs to write to async stream not in-memory bufffer) -> Binario is my own prototype of a Rust library to do this but it's not prod ready yet.
//!
use thiserror::Error;
use uuid::Uuid;

pub mod decode {
	use crate::spacetunnel::IdentityErr;

	use super::*;
	use tokio::io::{AsyncRead, AsyncReadExt};

	#[derive(Error, Debug)]
	pub enum Error {
		#[error("IoError({0})")]
		IoError(#[from] std::io::Error),
		#[error("UuidFormatError({0})")]
		UuidFormatError(#[from] uuid::Error),
		#[error("NameFormatError({0})")]
		NameFormatError(#[from] std::string::FromUtf8Error),
		#[error("InvalidRemoteIdentity({0})")]
		InvalidRemoteIdentity(#[from] IdentityErr),
	}

	/// Deserialize uuid as it's fixed size data.
	pub async fn uuid(stream: &mut (impl AsyncRead + Unpin)) -> Result<Uuid, Error> {
		let mut buf = vec![0u8; 16];
		stream.read_exact(&mut buf).await?;
		Uuid::from_slice(&buf).map_err(Into::into)
	}

	/// Deserialize string as it's u16 length and data.
	pub async fn string(stream: &mut (impl AsyncRead + Unpin)) -> Result<String, Error> {
		let len = stream.read_u16_le().await?;

		let mut buf = vec![0u8; len as usize];
		stream.read_exact(&mut buf).await?;

		String::from_utf8(buf).map_err(Into::into)
	}

	/// Deserialize buf as it's u16 length and data.
	pub async fn buf(stream: &mut (impl AsyncRead + Unpin)) -> Result<Vec<u8>, Error> {
		let len = stream.read_u32_le().await?;

		let mut buf = vec![0u8; len as usize];
		stream.read_exact(&mut buf).await?;

		Ok(buf)
	}
}

pub mod encode {
	use super::*;

	/// Serialize uuid as it's fixed size data.
	pub fn uuid(buf: &mut Vec<u8>, uuid: &Uuid) {
		buf.extend(uuid.as_bytes());
	}

	/// Serialize string as it's u16 length and data.
	pub fn string(buf: &mut Vec<u8>, s: &str) {
		#[allow(clippy::panic)] // TODO: Remove this panic
		if s.len() > u16::MAX as usize {
			panic!("String is too long!"); // TODO: Chunk this so it will never error
		}
		buf.extend_from_slice(&(s.len() as u16).to_le_bytes());
		buf.extend(s.as_bytes());
	}

	/// Serialize buf as it's u16 length and data.
	pub fn buf(buf: &mut Vec<u8>, b: &[u8]) {
		#[allow(clippy::panic)] // TODO: Remove this panic
		if b.len() > u32::MAX as usize {
			panic!("Buf is too long!"); // TODO: Chunk this so it will never error
		}
		buf.extend_from_slice(&(b.len() as u32).to_le_bytes());
		buf.extend(b);
	}
}
